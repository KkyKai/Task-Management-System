CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE 
utf8_general_ci; 
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `user` (
`id` int NOT NULL, 
`username` varchar(50) NOT NULL, 
`password` varchar(255) NOT NULL, 
`email` varchar(100) NOT NULL,
`disabled` bool NOT NULL) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8; 

CREATE TABLE IF NOT EXISTS `grouptable` (
`group_name` varchar(50) NOT NULL PRIMARY KEY) ENGINE=InnoDB; 

INSERT INTO `user` (`id`, `username`, `password`, `email`, `disabled`) VALUES (1, 'test', 
'test', 'test@test.com', false); 

ALTER TABLE `user` ADD PRIMARY KEY (`id`); 

ALTER TABLE `user` MODIFY `id` int NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;

select * from user;

delete from user  where id = 4;

# drop table accounts;
# drop database nodelogin;

CREATE TABLE IF NOT EXISTS `grouptable` (
`group_name` varchar(50) NOT NULL PRIMARY KEY) ENGINE=InnoDB; 

INSERT INTO `grouptable` (`group_name`) VALUES ('admin'); 

select * from `grouptable`;

	CREATE TABLE IF NOT EXISTS `usergroup` (
	  `groupname` varchar(50) NOT NULL,
	  `userID` int NOT NULL,
	  PRIMARY KEY (`groupname`, `userID`),
	  FOREIGN KEY (`groupname`) REFERENCES `grouptable`(`group_name`),
	  FOREIGN KEY (`userID`) REFERENCES `user`(`id`)
	);

select * from `usergroup`;
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('admin'); 


