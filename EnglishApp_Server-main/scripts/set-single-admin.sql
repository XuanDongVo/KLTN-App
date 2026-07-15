-- Dang ky tai khoan tren ung dung truoc, sau do thay email ben duoi.
-- Script dam bao chi co mot tai khoan ADMIN (role ordinal 1).
SET @admin_email = 'thay-email-admin-o-day@example.com';

START TRANSACTION;

SET @target_exists = (
    SELECT COUNT(*)
    FROM users
    WHERE email = @admin_email
);

UPDATE users
SET role = 0
WHERE role <> 0
  AND @target_exists = 1;

UPDATE users
SET role = 1
WHERE email = @admin_email
  AND @target_exists = 1;

SELECT email, username, role
FROM users
WHERE email = @admin_email;

SELECT IF(@target_exists = 1, 'OK: single admin configured', 'ERROR: email not found') AS result;

COMMIT;
