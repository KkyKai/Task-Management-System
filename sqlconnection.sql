CREATE USER 'ky'@'localhost' IDENTIFIED BY 'root';

GRANT ALL PRIVILEGES ON nodelogin.* TO 'ky'@'localhost';

FLUSH PRIVILEGES;