CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE 
utf8_general_ci; 
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `user` (
`username` varchar(50) NOT NULL PRIMARY KEY, 
`password` varchar(255) NOT NULL, 
`email` varchar(100) NOT NULL,
`disabled` bool NOT NULL);


INSERT INTO `user` (`username`, `password`, `email`, `disabled`) VALUES ('-', 
'-', '-', false); 

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


select email from `user` where username = 'toxc' AND email = '';

CREATE TABLE IF NOT EXISTS `usergroup` (
# `id` int NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `groupname` varchar(50) NOT NULL,
  `userID` varchar(50),
  PRIMARY KEY (`groupname`, `userID`),
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
SET disabled = false
WHERE username = 'admintest3';

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
      FROM usergroup;

delete from `usergroup` where userID = 'pm1' and groupname = 'admin';

SELECT u.username, GROUP_CONCAT(ug.groupname ORDER BY ug.groupname ASC) AS groupnames
FROM user u
JOIN usergroup ug ON u.username = ug.userID
GROUP BY u.username;

select groupname from usergroup where userID = 'dev1';

SELECT email FROM user WHERE username = 'dev1';

SELECT DISTINCT groupname FROM usergroup WHERE userID = 'admintest3';

SELECT DISTINCT groupname FROM usergroup WHERE userID = 'admintest2';



drop table application;

CREATE TABLE application (
    app_acronym VARCHAR(255) NOT NULL,
    app_description VARCHAR(500),
    app_rnumber INT NOT NULL,
    app_startdate DATE NOT NULL,
    app_enddate DATE NOT NULL,
    app_permit_create VARCHAR(255),
    app_permit_open VARCHAR(255),
    app_permit_todolist VARCHAR(255),
    app_permit_doing VARCHAR(255),
    app_permit_done VARCHAR(255),
    PRIMARY KEY (app_acronym)
);

-- Inserting the first row
INSERT INTO `application` (
    `app_acronym`, 
    `app_description`,
	`app_rnumber`, 
    `app_startdate`, 
    `app_enddate`
) 
VALUES (
    'APP001', 
    'Project management application to track tasks and deadlines.', 
    '50',
    '2024-01-01', 
    '2024-12-31'
);

-- Inserting the second row
INSERT INTO `application` (
    `app_acronym`, 
    `app_description`, 
    `app_rnumber`, 
    `app_startdate`, 
    `app_enddate`
) 
VALUES (
    'APP002', 
    'Customer relationship management system to manage interactions with clients.', 
	'40',
    '2024-02-01', 
    '2024-11-30'
);

-- Inserting the third row
INSERT INTO `application` (
    `app_acronym`, 
    `app_description`, 
    `app_rnumber`, 
    `app_startdate`, 
    `app_enddate`
) 
VALUES (
    'APP003', 
    'Inventory management application for tracking stock levels and orders.', 
    '40',
    '2024-03-01', 
    '2024-10-31'
);

-- Inserting the fourth row
INSERT INTO `application` (
    `app_acronym`, 
    `app_description`, 
    `app_rnumber`, 
    `app_startdate`, 
    `app_enddate`
) 
VALUES (
    'APP004', 
    'Human resources management system to handle employee records and payroll.', 
    '30',
    '2024-04-01', 
    '2024-09-30'
);

select * from application;

SELECT app_permit_done FROM application WHERE app_acronym = 'test';

SELECT app_permit_create FROM application WHERE app_acronym = 'test';


select * from plan;

drop table plan;

select app_acronym, app_permit_open from application;
select app_acronym, app_permit_open from application where app_permit_open = '';


CREATE TABLE plan (
    plan_MVP_name VARCHAR(255) NOT NULL,
    plan_startDate DATE NOT NULL,
    plan_endDate DATE NOT NULL,
    plan_app_Acronym VARCHAR(255) NOT NULL,
    PRIMARY KEY (plan_MVP_name, plan_app_Acronym),
    FOREIGN KEY (plan_app_Acronym) REFERENCES application(app_acronym)
);








CREATE TABLE task (
    task_id VARCHAR(255) NOT NULL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    task_description VARCHAR (500),
    task_state VARCHAR(255) NOT NULL,
    task_createDate DATE NOT NULL,
    task_plan VARCHAR(255),
    task_app_Acronym VARCHAR(255) NOT NULL,
    task_creator VARCHAR(50) NOT NULL,
    task_owner VARCHAR(50) NOT NULL,
    FOREIGN KEY (task_plan) REFERENCES plan(plan_MVP_name),
    FOREIGN KEY (task_app_Acronym) REFERENCES application(app_acronym),
    FOREIGN KEY (task_creator) REFERENCES user(username),
    FOREIGN KEY (task_owner) REFERENCES user(username)
);

CREATE TABLE task_note (
    task_id VARCHAR(255) NOT NULL,
    notes TEXT NOT NULL,
    tasknote_created DATETIME NOT NULL,
    PRIMARY KEY (task_id, tasknote_created),
    FOREIGN KEY (task_id) REFERENCES task (task_id)
);

select * from task_note;

INSERT INTO task_note (task_id, notes, tasknote_created)
VALUES ('APP003_41', '\n This is a note for task 124.', '2024-08-12 14:30:01');


select * from task_note where task_id = 'APP003_41' order by tasknote_created desc;

select * from task_note order by tasknote_created desc;

select * from application;

select * from usergroup;

SELECT * FROM task where task_app_Acronym = 'APP003';

SELECT * FROM task where task_id = 'APP003_40';














