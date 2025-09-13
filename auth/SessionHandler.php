<?php

class SessionHandler {
    static function checkActiveSession() {
        if (!isset($_SESSION['user_id'])) {
            // Redirect to login page
            header('Location: index.php');
            exit; // Always exit after redirect
        }
    }
}