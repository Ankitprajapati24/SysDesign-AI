-- SQL command to manually promote user to admin role
UPDATE users SET role = 'admin' WHERE email = 'designdoc@gmail.com';

