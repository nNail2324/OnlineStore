import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/notification-context";
import { TiDelete } from "react-icons/ti";

const AdminSubcategory = () => {
    const { id } = useParams();
    const { showNotification } = useContext(NotificationContext);
    const [products, setProducts] = useState([]);
    const [subcategoryName, setSubcategoryName] = useState("");
    const [unit, setUnit] = useState("");

    const [searchQuery, setSearchQuery] = useState(""); 

    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        description: "",
        stock: "",
        attributes: [{ name: "", value: "" }],
        images: [""]
    });

    const [editMode, setEditMode] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    const attributeOptions = ["Цвет", "Размер", "Материал", "Производитель", "Страна производства", "Высота", "Ширина", "Толщина", "Стандарт", "Диаметр", "Вес", "Марка", "Длина", "Пачка"];
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubcategoryAndProducts = async () => {
            try {
                const subcategoryRes = await fetch(`/api/subcategory/single/${id}`);
                const subcategoryData = await subcategoryRes.json();
                setSubcategoryName(subcategoryData.name);
                setUnit(subcategoryData.unit);

                const productsRes = await fetch(`/api/product/subcategory/${id}`);
                const productsData = await productsRes.json();
                setProducts(productsData);
            } catch (error) {
                console.error("Ошибка при загрузке:", error);
                setSubcategoryName("Ошибка загрузки");
            }
        };
        fetchSubcategoryAndProducts();
    }, [id]);

    const onClickCard = (productId) => navigate(`/product/${productId}`);

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот товар?")) {
            return;
        }
    
        try {
            const response = await fetch(`/api/product/${productId}`, {
                method: "DELETE"
            });
    
            if (!response.ok) throw new Error("Ошибка при удалении товара");
    
            showNotification("Товар успешно удален");
            
            // Обновляем список товаров
            const updatedProducts = products.filter(p => p.ID !== productId);
            setProducts(updatedProducts);
        } catch (error) {
            console.error("Ошибка при удалении товара:", error);
            showNotification("Не удалось удалить товар", "error");
        }
    };

    const handleAttributeChange = (index, field, value) => {
        const updated = [...newProduct.attributes];
        updated[index][field] = value;
        setNewProduct({ ...newProduct, attributes: updated });
    };

    const handleImageChange = (index, value) => {
        const updated = [...newProduct.images];
        updated[index] = value;
        setNewProduct({ ...newProduct, images: updated });
    };

    const addAttributeField = () => setNewProduct({ ...newProduct, attributes: [...newProduct.attributes, { name: "", value: "" }] });
    const addImageField = () => setNewProduct({ ...newProduct, images: [...newProduct.images, ""] });

    const handleEditClick = (product) => {
        setEditMode(true);
        setEditingProductId(product.ID);

        const attributes = Array.isArray(product.attributes) ? product.attributes : [];
        const images = Array.isArray(product.images) ? product.images : [];

        setNewProduct({
            name: product.name || "",
            price: product.price || "",
            description: product.description || "",
            stock: product.stock || "",
            attributes: attributes.length > 0 ? attributes : [{ name: "", value: "" }],
            images: images.length > 0 ? images : [""]
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async () => {
        const { name, price, stock } = newProduct;
        if (!name || !price || !stock) {
            alert("Заполните обязательные поля");
            return;
        }

        const url = editMode
            ? `/api/product/update/${editingProductId}`
            : "/api/product/create";

        const method = editMode ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newProduct,
                    subcategory_id: id
                })
            });

            if (!response.ok) throw new Error("Ошибка при сохранении");

            showNotification(editMode ? "Товар обновлён!" : "Товар добавлен!");

            setNewProduct({
                name: "",
                price: "",
                description: "",
                stock: "",
                attributes: [{ name: "", value: "" }],
                images: [""]
            });
            setEditMode(false);
            setEditingProductId(null);

            const updatedProductsRes = await fetch(`/api/product/subcategory/${id}`);
            const updatedProducts = await updatedProductsRes.json();
            setProducts(updatedProducts);
        } catch (err) {
            console.error("Ошибка при сохранении товара:", err);
            alert("Ошибка при сохранении");
        }
    };

    const removeAttributeField = (index) => {
        const updated = [...newProduct.attributes];
        updated.splice(index, 1);
        setNewProduct({ ...newProduct, attributes: updated.length ? updated : [{ name: "", value: "" }] });
    };

    const removeImageField = (index) => {
        const updated = [...newProduct.images];
        updated.splice(index, 1);
        setNewProduct({ ...newProduct, images: updated.length ? updated : [""] });
    };

    // Фильтрация товаров по поисковому запросу
    const filteredProducts = products.filter((product) => {
        const search = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(search) ||
            product.price.toString().includes(search) ||
            product.stock.toString().includes(search)
        );
    });

    return (
        <div className="body-page">
            <div className="title-row">
                <div className="name"><label>{subcategoryName}</label></div>
            </div>

            <div className="type">
                <div className="black-title">
                    <label>{editMode ? "Редактировать товар" : "Новый товар"}</label>
                </div>

                <div className="admin-form">
                    <input
                        type="text"
                        placeholder="Название"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Цена"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="В наличии"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Описание"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                </div>

                <div className="black-title"><label>Атрибуты товара</label></div>
                <div className="types">
                    {newProduct.attributes.map((attr, i) => (
                        <div className="admin-form" key={i}>
                            <select
                                value={attr.name}
                                onChange={(e) => handleAttributeChange(i, "name", e.target.value)}
                            >
                                <option value="">Выберите атрибут</option>
                                {attributeOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <input
                                placeholder="Значение"
                                value={attr.value}
                                onChange={(e) => handleAttributeChange(i, "value", e.target.value)}
                            />
                            <div className="edit-button">
                                <TiDelete size={30} onClick={() => removeAttributeField(i)} />
                            </div>
                        </div>
                    ))}
                    <div className="attribute-button">
                        <button onClick={addAttributeField}>+ Атрибут</button>
                    </div>
                </div>

                <div className="black-title"><label>Изображения</label></div>
                    <div className="types">
                        {newProduct.images.map((img, i) => (
                            <div className="admin-form" key={i}>
                                <input
                                    placeholder="URL изображения"
                                    value={img}
                                    onChange={(e) => handleImageChange(i, e.target.value)}
                                />
                                <div className="edit-button">
                                    <TiDelete size={30} onClick={() => removeImageField(i)} />
                                </div>
                            </div>
                    ))}
                    <div className="attribute-button">
                        <button onClick={addImageField}>+ Изображение</button>
                    </div>
                </div>

                <div className="admin-button">
                    <div className="left-row">
                        <button onClick={handleSubmit}>
                            {editMode ? "Сохранить изменения" : "Добавить товар"}
                        </button>
                        {editMode && (
                            <button
                                onClick={() => {
                                    setEditMode(false);
                                    setNewProduct({
                                        name: "",
                                        price: "",
                                        description: "",
                                        stock: "",
                                        attributes: [{ name: "", value: "" }],
                                        images: [""]
                                    });
                                }}
                                className="cancel-button"
                            >
                                Отменить
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="admin-form">
                <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="types">
                {filteredProducts.map((product) => (
                    <div className="type" key={product.ID}>
                        <div className="basket-column">
                            <div className="delivery-column">
                                <div className="orange-title">
                                    <label>{product.name}</label>
                                </div>
                                <div className="left-row">
                                    <div className="orange-button">
                                        <button onClick={() => onClickCard(product.ID)}>Перейти</button>
                                    </div>
                                    <div className="white-button">
                                        <button onClick={() => handleEditClick(product)}>Изменить</button>
                                    </div>
                                    <div className="white-button">
                                        <button onClick={() => handleDeleteProduct(product.ID)}>Удалить</button>
                                    </div>
                                </div>
                            </div>
                            <div className="summary-column">
                                <div className="black-title">
                                    <label>{product.price.toLocaleString("ru-RU")} &#8381;/{unit}.</label>
                                </div>
                                <div className="black-text">
                                    <label>На складе: {product.stock} шт.</label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSubcategory;
