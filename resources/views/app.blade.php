<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <meta name="theme-color" content="#ffffff">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">

        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Bachelor Thesis Defense Portal • FITS BELTEI') }}</title>

        <!-- Search Engine & Social Media Sharing Meta Tags (Telegram, Facebook, Messenger, WhatsApp) -->
        <meta name="description" content="Official Bachelor Thesis Defense candidate roster, evaluation marks, UMS profile verification & book signature portal. Faculty of Information Technology & Science, BELTEI International University.">
        <meta name="keywords" content="BELTEI, BELTEI International University, Thesis Defense, Faculty of IT, FITS, Bachelor Thesis, Cambodia, Student Portal">
        <meta name="author" content="Faculty of Information Technology & Science - BELTEI IU">

        <!-- Open Graph / Facebook / Telegram / WhatsApp -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:site_name" content="BELTEI International University">
        <meta property="og:title" content="Bachelor Thesis Defense Portal • FITS BELTEI">
        <meta property="og:description" content="Check thesis defense scores, research topics, and confirm your in-person thesis book signature. Faculty of Information Technology & Science.">
        <meta property="og:image" content="{{ asset('images/beltei-logo.png') }}">
        <meta property="og:image:secure_url" content="{{ asset('images/beltei-logo.png') }}">
        <meta property="og:image:type" content="image/png">
        <meta property="og:image:width" content="600">
        <meta property="og:image:height" content="600">
        <meta property="og:image:alt" content="BELTEI International University Emblem">

        <!-- Twitter / Telegram Cards -->
        <meta name="twitter:card" content="summary">
        <meta name="twitter:title" content="Bachelor Thesis Defense Portal • FITS BELTEI">
        <meta name="twitter:description" content="Check thesis defense scores, research topics, and confirm your in-person thesis book signature. Faculty of Information Technology & Science.">
        <meta name="twitter:image" content="{{ asset('images/beltei-logo.png') }}">

        <!-- Favicons & Mobile Home Screen Icons -->
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/beltei-logo.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/beltei-logo.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/beltei-logo.png') }}">
        <link rel="shortcut icon" href="{{ asset('images/favicon.ico') }}">

        <!-- Google Fonts: Plus Jakarta Sans, Outfit, & Kantumruy Pro (Modern Khmer) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

        <!-- Scripts and Styles -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-slate-50 text-slate-800 min-h-screen selection:bg-[#C1AA3F] selection:text-slate-950">
        @inertia
    </body>
</html>
