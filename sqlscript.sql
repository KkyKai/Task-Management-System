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


delete from usergroup  where id = 15;
delete from user  where username = 'admin1';

# drop table usergroup;
# drop table user;
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


INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('admin', 'admin'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('project lead', 'pl1'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('project manager', 'pm1'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('developer', 'dev1'); 

INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('project lead', 'dev1'); 

INSERT INTO `usergroup` (`groupname`) VALUES ('admin'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('project lead'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('project manager'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('developer'); 
INSERT INTO `usergroup` (`groupname`) VALUES ('monkey'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('monkey', 'pm1'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('monkey', 'pm1'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('monkey', 'pm1'); 
INSERT INTO `usergroup` (`groupname`, `userID`) VALUES ('project manager', 'dev1'); 

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
    WHERE userID = 'dev1' AND groupname = 'developer';
    
    
    SELECT * FROM user join usergroup on user.username = usergroup.userID;
    
	SELECT u.username, u.email, u.password, u.disabled, GROUP_CONCAT(ug.groupname) AS groupname, GROUP_CONCAT(ug.id) AS id
	FROM user u
	JOIN usergroup ug ON u.username = ug.userID
	GROUP BY u.username;

UPDATE user
SET email = 'tx@gmail.com', disabled = true
WHERE username = 'pm1';

UPDATE usergroup
      SET groupname = 'monkey'
WHERE userID = 'pm1' and id = 12;

select * from usergroup;

SET SQL_SAFE_UPDATES = 0;
DELETE FROM usergroup
WHERE groupname = 'monkey';
SET SQL_SAFE_UPDATES = 1;


      SELECT GROUP_CONCAT(groupname) AS groupname, GROUP_CONCAT(id) AS id, userID
      FROM usergroup
      GROUP BY userID;
      
      SELECT DISTINCT groupname
      FROM usergroup

delete from `usergroup` where userID = 'pm1' and groupname = 'admin';

SELECT u.username, GROUP_CONCAT(ug.groupname ORDER BY ug.groupname ASC) AS groupnames
FROM user u
JOIN usergroup ug ON u.username = ug.userID
GROUP BY u.username;

select groupname from usergroup where userID = 'dev1';

SELECT email FROM user WHERE username = 'dev1';



