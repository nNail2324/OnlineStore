CREATE TABLE location_and_delivery (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    delivery_price INT
);

CREATE TABLE users (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    password VARCHAR(200),
    phone_number VARCHAR(50),
    name VARCHAR(50),
    surname VARCHAR(50),
    city INT,
    street VARCHAR(50),
    house_number INT,
    role ENUM('user', 'admin') DEFAULT 'user',
    FOREIGN KEY (city) REFERENCES location_and_delivery(ID) ON DELETE SET NULL
);

CREATE TABLE requests (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    phone_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE category (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    image VARCHAR(100)
);

CREATE TABLE subcategory (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    name VARCHAR(100),
    unit VARCHAR(20),
    FOREIGN KEY (category_id) REFERENCES category(ID) ON DELETE CASCADE
);

CREATE TABLE product (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    subcategory_id INT,
    name VARCHAR(50),
    price INT,
    description VARCHAR(500),
    stock INT,
    FOREIGN KEY (subcategory_id) REFERENCES subcategory(ID) ON DELETE CASCADE
);

CREATE TABLE product_attributes (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    attribute_name VARCHAR(100),
    attribute_value VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES product(ID) ON DELETE CASCADE
);

CREATE TABLE product_images (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    path VARCHAR(300),
    FOREIGN KEY (product_id) REFERENCES product(ID) ON DELETE CASCADE
);

CREATE TABLE orders (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total_price INT,
    delivery_method ENUM('pickup', 'courier') DEFAULT 'pickup',
    delivery_price INT DEFAULT 0,
    status ENUM('В обработке', 'В пути', 'Доставлен', 'Отменён') DEFAULT 'В обработке',
    contact_name VARCHAR(100),
    contact_phone VARCHAR(50),
    delivery_address VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE
);

CREATE TABLE order_items (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT,
    price INT,
    FOREIGN KEY (order_id) REFERENCES orders(ID) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(ID) ON DELETE CASCADE
);

CREATE TABLE cart (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(ID) ON DELETE CASCADE
);

CREATE TABLE feedback (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT,
    mark TINYINT(1),
    description VARCHAR(300),
    created_at DATE,
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(ID) ON DELETE CASCADE
);

DELIMITER $$

CREATE TRIGGER set_feedback_date
BEFORE INSERT ON feedback
FOR EACH ROW
BEGIN
    SET NEW.created_at = CURDATE();
END $$
DELIMITER ;

CREATE TABLE favorite (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT,
    FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(ID) ON DELETE CASCADE
);

INSERT INTO location_and_delivery (name, delivery_price) VALUES
	('Чекмагуш', 0),
	('Аблай', 1800),
	('Ахметово (Чекмагушевский р-н)', 2000),
	('Байбулат', 1800),
	('Бардаслы', 2500),
	('Биккино, Ст. Биккино', 1300),
	('Булгар', 1800),
	('Буляк', 2300),
	('Верхний Аташ', 2000),
	('Земей', 2000),
	('Имянликуль', 2000),
	('Кавказ', 1500),
	('Калмашбаш', 1300),
	('Каразирек', 1800),
	('Каран (Чекмагушевский р-н)', 1800),
	('Каратал', 2500),
	('Каргалы', 1800),
	('Кашак', 800),
	('Кашкар', 1500),
	('Киндеркуль', 1800),
	('Кусекей', 1800),
	('Ленино', 1500),
	('Макаровка', 1800),
	('Митро-аюпово', 2000),
	('Муртаз', 2000),
	('Нариман', 500),
	('Ниж. Карьявды', 1800),
	('Николаевка', 1000),
	('Нов. Балак', 2300),
	('Нов. Ихсан', 2000),
	('Нов. Калмаш', 2200),
	('Нов. Карьявды', 2000),
	('Нов. Пучкак', 2800),
	('Новобалтачево', 1500),
	('Новокутово', 1000),
	('Новосеменкино', 2200),
	('Нур', 1800),
	('Рапат', 1200),
	('Резяп', 2000),
	('Ресмекей', 800),
	('Ст. Балак', 2000),
	('Ст. Башир', 2000),
	('Ст. Ихсан', 2000),
	('Ст. Калмаш', 1000),
	('Ст. Муртаз', 2300),
	('Ст. Пучкак', 2300),
	('Сыйрышбаш', 1300),
	('Тайняш', 1800),
	('Тамьян', 1500),
	('Таскаклы', 1800),
	('Ташкалмаш', 1800),
	('Тузлукуш', 1700),
	('Тукай', 1200),
	('Узмяш', 2000),
	('Уйбулат', 2300),
	('Урняк', 1500),
	('Чишма Каран', 2600),
	('Чиялекуль', 2300),
	('Чупты', 1700),
	('Чуртанбаш', 2000),
	('Юмаш', 2000),
	('Юмран', 2300),
	('Яна Бирде', 2000),
	('Яшкуч', 2000),
	('Байталы', 3000),
	('Бакай', 3000),
	('Илек', 2500),
	('Купай', 2500),
	('Бишкурай', 2200),
	('Дюмей', 3000),
	('Илякшиде', 3000),
	('Камай', 3500),
	('Килькабыз', 3500),
	('Ст. Гусево', 2500),
	('Абзан', 3000),
	('Амир', 3000),
	('Ахун', 2000),
	('Идяшбаш (Нов. Сабай)', 3000),
	('Каразирек', 2500),
	('Каран', 3500),
	('Каратамак', 2800),
	('Килим', 2800),
	('Красный Яр', 2500),
	('Кузей', 2500),
	('Кыскакулбаш', 2800),
	('Нов. Чатра', 2500),
	('Сабай', 2800),
	('Савады', 2500),
	('Сирек Каен', 2800),
	('Ст. Карбаш', 3500),
	('Таулар', 3000),
	('Тугай', 3000),
	('Тюрюш', 2300),
	('Усмановский', 3000),
	('Чишма', 2800),
	('Шигай', 3000),
	('Якуп', 2800),
	('Ахметово (Бакалинский р-н)', 3500),
	('Ахун', 3500),
	('Кучербай', 2800),
	('Байгильды', 2500),
	('Байки', 2500),
	('Григорьевка', 3000),
	('Михайловка', 3000),
	('Нов. Юмаш', 3000),
	('Рождественка', 3000),
	('Тимирово', 3000),
	('Три Ключа', 3000),
	('Юность', 3000);

INSERT INTO users (password, phone_number, role) VALUES
	("$2a$10$x0V.2lsOjAzXfmYAlEjlBujHnnDIT972l4mZFIXgrkPzPGWLqBLjC", "+79961061302", "admin");

INSERT INTO category (name, image) VALUES
    ("Стеновые материалы", "sheet_materilas"),
    ("Сыпучие смеси", "bulk_mixtures"),
    ("Металлопрокат", "metal_meterials"),
    ("Листовые материалы", "wall_materials"),
    ("Железобетонные изделия", "reinforced_concrete");

INSERT INTO subcategory (category_id, name, unit) VALUES 
    (1, "Кирпич", "шт"),
    (1, "Керамзитовый блок", "шт"),
    (1, "Газобетонный блок", "шт"),
    (2, "Цемент", "шт"),
    (2, "Песок", "т"),
    (2, "Щебень", "т"),
    (2, "Песчано-гравийная смесь", "т"),
    (3, "Уголок", "м"),
    (3, "Арматура", "м"),
    (3, "Трубы профильные", "м"),
    (3, "Трубы круглые", "м"),
    (3, "Швеллер", "м"),
    (4, "Фанера", "шт"),
    (4, "Гипсокартон", "шт"),
    (4, "МДФ", "шт"),
    (4, "ДВП", "шт"),
    (4, "ОСП", "шт"),
    (5, "Кольца", "шт"),
    (5, "Крышки", "шт"),
    (5, "Блоки", "шт");

INSERT INTO product (subcategory_id, name, price, description)
VALUES 
    (8, 'Уголок стальной 25х25', 120.00, 'Уголок'),
    (8, 'Уголок стальной 32х32', 160.00, 'Уголок'),
    (8, 'Уголок стальной 35х35', 170.00, 'Уголок'),
    (8, 'Уголок стальной 40х40', 210.00, 'Уголок'),
    (8, 'Уголок стальной 45х45', 240.00, 'Уголок'),
    (4, 'Цемент М-500 (1 т.)', 11000.00, 'Цемент'),
    (4, 'Цемент М-500 (50 кг.)', 550.00, 'Цемент'),
    (4, 'Цемент М-500 (25 кг.)', 290.00, 'Цемент');

INSERT INTO product_attributes (product_id, attribute_name, attribute_value) VALUES
    (1, 'Высота', '25 мм'),
    (1, 'Ширина', '25 мм'),
    (1, 'Толщина', '3 мм'),
    (1, 'Материал', 'Сталь'),
    (1, 'Стандарт', 'ГОСТ 8509-93'),
    (2, 'Высота', '32 мм'),
    (2, 'Ширина', '32 мм'),
    (2, 'Толщина', '4 мм'),
    (2, 'Материал', 'Сталь'),
    (6, 'Бренд', 'Heidelbergcement'),
    (6, 'Марка', 'М500'),
    (6, 'Вес', '1000 кг'),
    (7, 'Бренд', 'Heidelbergcement'),
    (7, 'Марка', 'М500'),
    (7, 'Вес', '50 кг');

INSERT INTO product_images (product_id, path) VALUES    
    (1, "corner.png"),
    (2, "corner.png"),
    (3, "corner.png"),
    (4, "corner.png"),
    (5, "corner.png"),
    (1, "corner-25x25.svg"),
    (2, "corner-32x32.svg"),
    (3, "corner-35x35.svg"),
    (4, "corner-40x40.svg"),
    (5, "corner-45x45.svg");
