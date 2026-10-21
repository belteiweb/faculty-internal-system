<?php

namespace App\Http\Controllers;

use App\Models\Supervisor;
use App\Models\ThesisReport;
use App\Models\ThesisStudent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ThesisController extends Controller
{
    /**
     * Public Student Portal (Mobile-First search & verification, QR code target).
     * Does NOT expose all records publicly upfront; users search by Name (EN/KH) or Student ID.
     */
    public function index(Request $request): Response
    {
        $hasSearch = $request->filled('search');
        $hasClass = $request->filled('class_code');
        $hasFilter = $hasSearch || $hasClass || $request->filled('major') || $request->filled('campus') || $request->filled('supervisor');

        $students = null;
        $suggestions = [];
        $matchedClasses = [];

        if ($hasFilter) {
            $query = ThesisStudent::query();

            // Search by ID or Name (Latin and Khmer)
            if ($search = trim($request->input('search', ''))) {
                $query->where(function ($q) use ($search) {
                    $q->where('name_latin', 'like', "%{$search}%")
                      ->orWhere('name_khmer', 'like', "%{$search}%")
                      ->orWhere('student_id', 'like', "%{$search}%")
                      ->orWhere('student_id_formatted', 'like', "%{$search}%")
                      ->orWhere('topic_title', 'like', "%{$search}%");
                });
            }

            // Filter by Class (e.g. SE-E1, SE-E2, SE-E3)
            if ($classCode = $request->input('class_code')) {
                $query->where('class_code', $classCode);
            }

            // Filter by Campus
            if ($campus = $request->input('campus')) {
                $query->where('campus_code', $campus);
            }

            // Filter by Major
            if ($major = $request->input('major')) {
                $query->where('major_code', $major);
            }

            // Filter by Shift
            if ($shift = $request->input('shift')) {
                $query->where('shift', $shift);
            }

            // Filter by Supervisor
            if ($supervisor = $request->input('supervisor')) {
                $query->where('supervisor_name', $supervisor);
            }

            // Filter by Pass / Fail status
            if ($resultStatus = $request->input('result_status')) {
                if ($resultStatus === 'PASS') {
                    $query->where('result_status', 'PASS');
                } elseif ($resultStatus === 'FAIL') {
                    $query->where('result_status', '!=', 'PASS');
                }
            }

            // Filter by Signature Status
            if ($request->has('signed') && $request->input('signed') !== null && $request->input('signed') !== '') {
                $query->where('signed', (bool)$request->input('signed'));
            }

            // Sorting
            $sortBy = $request->input('sort_by', 'name_latin');
            $sortDir = $request->input('sort_dir', 'asc');
            $allowedSorts = ['name_latin', 'student_id', 'class_code', 'group_no', 'score', 'supervisor_name', 'signed'];
            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
            } else {
                $query->orderBy('class_code')->orderBy('name_latin');
            }

            $students = $query->paginate(15)->withQueryString();

            // Classes present in current matched set (helps student filter if multiple people have same name)
            if ($students->total() > 1 && $hasSearch) {
                $matchedClasses = ThesisStudent::query()
                    ->where(function ($q) use ($search) {
                        $q->where('name_latin', 'like', "%{$search}%")
                          ->orWhere('name_khmer', 'like', "%{$search}%")
                          ->orWhere('student_id', 'like', "%{$search}%");
                    })
                    ->distinct()
                    ->pluck('class_code')
                    ->filter()
                    ->values()
                    ->all();
            }

            // Fuzzy suggestion engine if 0 exact matches found
            if ($students->total() === 0 && $hasSearch) {
                $suggestions = $this->getFuzzySuggestions($search);
            }
        }

        // Dropdown options
        $campuses = [
            ['code' => 'UC1', 'name' => 'Campus 1 (Tuol Sleng)'],
            ['code' => 'UC2', 'name' => 'Campus 2 (Chom Chao)'],
        ];

        $majors = [
            ['code' => 'SE', 'name' => 'Software Engineering (SE)'],
            ['code' => 'CNCS', 'name' => 'Computer Networking & Cyber Security (CNCS)'],
            ['code' => 'CMD', 'name' => 'Computer Multimedia Design (CMD)'],
        ];

        $classes = ThesisStudent::select('class_code')
            ->distinct()
            ->whereNotNull('class_code')
            ->orderBy('class_code')
            ->pluck('class_code');

        $supervisors = Supervisor::orderBy('name')->pluck('name');

        // High-level statistics
        $stats = [
            'total_students' => ThesisStudent::count(),
            'total_passed' => ThesisStudent::where('result_status', 'PASS')->count(),
            'total_signed' => ThesisStudent::where('signed', true)->count(),
            'total_unsigned' => ThesisStudent::where('signed', false)->count(),
        ];

        return Inertia::render('Thesis/Index', [
            'students' => $students,
            'suggestions' => $suggestions,
            'matchedClasses' => $matchedClasses,
            'filters' => $request->only(['search', 'campus', 'major', 'class_code', 'shift', 'supervisor', 'result_status', 'signed', 'sort_by', 'sort_dir']),
            'options' => [
                'campuses' => $campuses,
                'majors' => $majors,
                'classes' => $classes,
                'supervisors' => $supervisors,
            ],
            'stats' => $stats,
            'initialState' => !$hasFilter,
            'appUrl' => url('/'),
        ]);
    }

    /**
     * Dedicated single student card view.
     */
    public function show(string $studentId): Response
    {
        $student = ThesisStudent::where('student_id', $studentId)
            ->orWhere('student_id_formatted', $studentId)
            ->firstOrFail();

        return Inertia::render('Thesis/StudentCard', [
            'student' => $student,
        ]);
    }

    /**
     * Toggle signature confirmation checkbox with optional student verification.
     */
    public function toggleSignature(Request $request, int $id)
    {
        $student = ThesisStudent::findOrFail($id);
        $newStatus = $request->has('signed') ? (bool)$request->input('signed') : !$student->signed;

        // Toggle signature confirmation
        if ($newStatus) {
            if ($phone = $request->input('contact_phone')) {
                $student->phone = trim($phone);
            }

            $student->signed = true;
            $student->signed_at = now();
            $student->signed_device_ip = $request->ip();
            $student->signature_notes = $request->input('notes', 'Confirmed in-person');
        } else {
            // Unchecking signature
            $student->signed = false;
            $student->signed_at = null;
            $student->signature_notes = null;
            $student->signed_device_ip = null;
        }

        $student->save();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'signed' => $student->signed,
                'signed_at' => $student->signed_at ? $student->signed_at->toDateTimeString() : null,
                'message' => $newStatus ? 'Signature confirmed successfully!' : 'Signature unconfirmed.',
                'student' => $student,
            ]);
        }

        return back()->with('success', $newStatus ? 'Signature confirmed!' : 'Signature unmarked.');
    }

    /**
     * Student Report Issue Submission.
     */
    public function submitReport(Request $request)
    {
        $validated = $request->validate([
            'thesis_student_id' => 'required|exists:thesis_students,id',
            'issue_type' => 'required|string|in:wrong_topic,wrong_questions,wrong_supervisor,name_id_error,score_error,signature_issue,other',
            'description' => 'required|string|min:5|max:2000',
            'contact_phone' => 'nullable|string|max:30',
        ]);

        $student = ThesisStudent::findOrFail($validated['thesis_student_id']);

        $report = ThesisReport::create([
            'thesis_student_id' => $student->id,
            'student_id_code' => $student->student_id,
            'student_name' => $student->name_latin,
            'issue_type' => $validated['issue_type'],
            'description' => $validated['description'],
            'contact_phone' => $validated['contact_phone'] ?? null,
            'status' => 'pending',
            'submitter_ip' => $request->ip(),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Your report has been submitted to the faculty office for verification.',
                'report' => $report,
            ]);
        }

        return back()->with('success', 'Issue report submitted successfully!');
    }

    /**
     * Faculty Controller / Admin Management Dashboard (Protected).
     */
    public function dashboard(Request $request): Response
    {
        $query = ThesisStudent::query();

        if ($search = $request->input('search')) {
            $search = trim($search);
            $query->where(function ($q) use ($search) {
                $q->where('name_latin', 'like', "%{$search}%")
                  ->orWhere('name_khmer', 'like', "%{$search}%")
                  ->orWhere('student_id', 'like', "%{$search}%")
                  ->orWhere('supervisor_name', 'like', "%{$search}%")
                  ->orWhere('topic_title', 'like', "%{$search}%");
            });
        }

        if ($campus = $request->input('campus')) {
            $query->where('campus_code', $campus);
        }

        if ($major = $request->input('major')) {
            $query->where('major_code', $major);
        }

        if ($classCode = $request->input('class_code')) {
            $query->where('class_code', $classCode);
        }

        if ($supervisor = $request->input('supervisor')) {
            $query->where('supervisor_name', $supervisor);
        }

        if ($request->has('signed') && $request->input('signed') !== null && $request->input('signed') !== '') {
            $query->where('signed', (bool)$request->input('signed'));
        }

        if ($resultStatus = $request->input('result_status')) {
            $query->where('result_status', $resultStatus);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'class_code');
        $sortDir = $request->input('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int)$request->input('per_page', 25);
        $students = $query->paginate($perPage)->withQueryString();

        // Stats by class breakdown
        $classBreakdown = ThesisStudent::selectRaw('class_code, campus_code, major_code, count(*) as total, sum(case when signed = 1 then 1 else 0 end) as signed_count, sum(case when result_status = "PASS" then 1 else 0 end) as passed_count')
            ->groupBy('class_code', 'campus_code', 'major_code')
            ->orderBy('class_code')
            ->get();

        $stats = [
            'total_students' => ThesisStudent::count(),
            'total_passed' => ThesisStudent::where('result_status', 'PASS')->count(),
            'total_failed' => ThesisStudent::where('result_status', 'FAIL')->count(),
            'total_signed' => ThesisStudent::where('signed', true)->count(),
            'total_unsigned' => ThesisStudent::where('signed', false)->count(),
            'total_reports' => ThesisReport::count(),
            'pending_reports' => ThesisReport::where('status', 'pending')->count(),
            'signature_percentage' => ThesisStudent::count() > 0 ? round((ThesisStudent::where('signed', true)->count() / ThesisStudent::count()) * 100, 1) : 0,
        ];

        $classes = ThesisStudent::select('class_code')->distinct()->orderBy('class_code')->pluck('class_code');
        $supervisors = Supervisor::orderBy('name')->pluck('name');

        return Inertia::render('Controller/Dashboard', [
            'students' => $students,
            'filters' => $request->only(['search', 'campus', 'major', 'class_code', 'supervisor', 'signed', 'result_status', 'sort_by', 'sort_dir', 'per_page']),
            'stats' => $stats,
            'classBreakdown' => $classBreakdown,
            'options' => [
                'classes' => $classes,
                'supervisors' => $supervisors,
            ],
            'qrCodeUrl' => url('/thesis'),
        ]);
    }

    /**
     * Faculty Controller Reports Management (Protected).
     */
    public function reports(Request $request): Response
    {
        $query = ThesisReport::with('student')->latest();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->input('issue_type')) {
            $query->where('issue_type', $type);
        }

        $reports = $query->paginate(20)->withQueryString();

        return Inertia::render('Controller/Reports', [
            'reports' => $reports,
            'filters' => $request->only(['status', 'issue_type']),
            'counts' => [
                'pending' => ThesisReport::where('status', 'pending')->count(),
                'under_review' => ThesisReport::where('status', 'under_review')->count(),
                'resolved' => ThesisReport::where('status', 'resolved')->count(),
                'dismissed' => ThesisReport::where('status', 'dismissed')->count(),
            ],
        ]);
    }

    /**
     * Update status of reported issue (Protected).
     */
    public function updateReportStatus(Request $request, int $id)
    {
        $report = ThesisReport::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,under_review,resolved,dismissed',
            'admin_notes' => 'nullable|string',
        ]);

        $report->status = $validated['status'];
        if (isset($validated['admin_notes'])) {
            $report->admin_notes = $validated['admin_notes'];
        }
        if ($validated['status'] === 'resolved') {
            $report->resolved_at = now();
        }

        $report->save();

        return back()->with('success', 'Report status updated.');
    }

    /**
     * Helper to compute fuzzy name/ID suggestions when no exact match is found.
     */
    protected function getFuzzySuggestions(string $search): array
    {
        $searchUpper = strtoupper($search);
        $searchWords = explode(' ', $searchUpper);

        $candidates = ThesisStudent::select('id', 'student_id', 'name_latin', 'name_khmer', 'class_code', 'major_code', 'score', 'result_status')
            ->get();

        $scored = [];

        foreach ($candidates as $c) {
            $name = strtoupper($c->name_latin);
            $score = 0;

            // Check if any word matches
            foreach ($searchWords as $w) {
                if (strlen($w) >= 3 && str_contains($name, $w)) {
                    $score += 50;
                }
            }

            // Substring similarity percentage
            similar_text($searchUpper, $name, $pct);
            $score += $pct;

            // Numeric ID similarity if search has digits
            if (is_numeric($search) && str_contains($c->student_id, $search)) {
                $score += 80;
            }

            if ($score >= 45) {
                $scored[] = [
                    'student' => $c,
                    'score' => $score,
                ];
            }
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_map(fn ($item) => $item['student'], array_slice($scored, 0, 4));
    }
}
