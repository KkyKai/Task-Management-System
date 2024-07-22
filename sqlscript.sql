CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE 
utf8_general_ci; 
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `user` (
`username` varchar(50) NOT NULL PRIMARY KEY, 
`password` varchar(255) NOT NULL, 
`email` varchar(100) NOT NULL,
`disabled` bool NOT NULL);


INSERT INTO `user` (`username`, `password`, `email`, `disabled`) VALUES ('test', 
'test', 'test@test.com', false); 

select * from user;

delete from user  where id = 4;

# drop table usergroup;
# drop database nodelogin;

INSERT INTO `usergroup` (`groupname`) VALUES ('admin'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('project lead'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('project manager'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('developer'); 


select * from `user`;

CREATE TABLE IF NOT EXISTS `usergroup` (
`id` int NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `groupname` varchar(50) NOT NULL,
  `userID` varchar(50),
  FOREIGN KEY (`userID`) REFERENCES `user`(`username`)
);

ALTER TABLE `usergroup` AUTO_INCREMENT = 1;

select * from `usergroup`;


INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('admin', 'user123'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('project lead', 'pl1'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('project manager', 'pm1'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('developer', 'dev1'); 

INSERT INTO `usergroup` (`groupname`) VALUES ('admin'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('project lead'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('project manager'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('developer'); 

SELECT COUNT(*) AS count FROM usergroup WHERE userID = 'pl1' AND groupname = 'admin';


select * from `usergroup` join user on userID = id
where userID = 'pl1';


SELECT user.username, usergroup.groupname
    FROM user
    JOIN usergroup ON user.username = usergroup.userID
    WHERE user.username = 'dev1';
    
SELECT userID, groupname
    FROM usergroup
    WHERE userID = 'dev1';
    
    
 SELECT * FROM user INNER JOIN usergroup ON user.username = usergroup.userID WHERE username = 'dev1';
 
     SELECT COUNT(*) AS count
    FROM usergroup
    WHERE userID = 'dev1' AND groupname = 'developer'


