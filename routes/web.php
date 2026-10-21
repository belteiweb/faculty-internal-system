<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ThesisController;
use Illuminate\Support\Facades\Route;

// Public Student Thesis Portal (Mobile-First QR Code Target)
Route::get('/', function () {
    return redirect()->route('thesis.index');
});

Route::prefix('thesis')->name('thesis.')->group(function () {
    Route::get('/', [ThesisController::class, 'index'])->name('index');
    Route::get('/student/{studentId}', [ThesisController::class, 'show'])->name('student.show');
    Route::post('/student/{id}/toggle-signature', [ThesisController::class, 'toggleSignature'])->name('student.signature')->middleware('throttle:60,1');
    Route::post('/report', [ThesisController::class, 'submitReport'])->name('report.submit')->middleware('throttle:15,1');
});

// Admin Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:10,1');
});
Route::post('/logout', [AuthController::class, 'destroy'])->name('logout')->middleware('auth');

// Faculty Controller / Admin Management (Protected by Auth)
Route::prefix('controller')->name('controller.')->middleware('auth')->group(function () {
    Route::get('/', function () {
        return redirect()->route('controller.dashboard');
    });
    Route::get('/dashboard', [ThesisController::class, 'dashboard'])->name('dashboard');
    Route::get('/reports', [ThesisController::class, 'reports'])->name('reports');
    Route::patch('/reports/{id}', [ThesisController::class, 'updateReportStatus'])->name('reports.update');
    Route::post('/password', [AuthController::class, 'updatePassword'])->name('password.update');
});
