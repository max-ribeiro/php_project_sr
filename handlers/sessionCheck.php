<?php
session_start();
if (!isset($_SESSION['user'])) {
    // Redirect to login page
    header('Location: /');
    exit; // Always exit after redirect
}