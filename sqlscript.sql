CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE 
utf8_general_ci; 
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
`id` int NOT NULL, 
`username` varchar(50) NOT NULL, 
`password` varchar(255) NOT NULL, 
`email` varchar(100) NOT NULL ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8; 

INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (1, 'test', 
'test', 'test@test.com'); 

ALTER TABLE `accounts` ADD PRIMARY KEY (`id`); 

ALTER TABLE `accounts` MODIFY `id` int NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;

select * from accounts;

delete from accounts where id = 4;

# drop table accounts;
# drop database nodelogin;