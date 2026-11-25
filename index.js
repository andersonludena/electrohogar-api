const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Catálogo oficial de productos almacenado en el servidor
const products = [
  {
    id: 1,
    name: "Refrigeradora No Frost",
    category: "Refrigeración",
    price: 1899.90,
    description: "Refrigeradora No Frost de gran capacidad para conservar alimentos y bebidas.",
    imageUrl: "https://picsum.photos/seed/refrigeradora/800/600"
  },
  {
    id: 2,
    name: "Lavadora Automática",
    category: "Lavado",
    price: 1299.90,
    description: "Lavadora automática con diferentes programas para el cuidado de la ropa.",
    imageUrl: "https://picsum.photos/seed/lavadora/800/600"
  },
  {
    id: 3,
    name: "Horno Microondas",
    category: "Cocina",
    price: 499.90,
    description: "Microondas compacto para calentar y preparar alimentos rápidamente.",
    imageUrl: "https://picsum.photos/seed/microondas/800/600"
  }
];

// Lista en memoria de pedidos realizados
let nextOrderId = 101;
const orders = [
  {
    id: 100,
    userId: 1,
    customerName: "Cliente Demo",
    address: "Av. Arequipa 1234, Lima",
    createdAt: new Date().toISOString(),
    products: [
      {
        id: 3,
        title: "Horno Microondas",
        price: 499.90,
        quantity: 1,
        total: 499.90
      }
    ],
    total: 499.90,
    totalProducts: 1,
    totalQuantity: 1
  }
];

app.get('/', (req, res) => {
  res.json({
    status: "OK",
    service: "ElectroHogar Backend API - PA4",
    endpoints: {
      products: "GET /products",
      orders: "GET /orders",
      createOrder: "POST /carts/add"
    }
  });
});

// Obtener catálogo de productos
app.get('/products', (req, res) => {
  res.json(products);
});

// Consultar pedidos registrados (para validar sincronización entre 2 celulares)
app.get('/orders', (req, res) => {
  res.json(orders);
});

// Registrar un nuevo pedido desde la app Android
app.post('/carts/add', (req, res) => {
  const {
    userId = 1,
    customerName = "Cliente App",
    address = "Sin dirección",
    products: reqProducts = []
  } = req.body;

  if (!Array.isArray(reqProducts) || reqProducts.length === 0) {
    return res.status(400).json({ error: "El carrito no puede estar vacío" });
  }

  let total = 0;
  let totalQuantity = 0;

  const detailedProducts = reqProducts.map((item) => {
    const found = products.find((p) => p.id === item.id);
    const title = found ? found.name : `Producto #${item.id}`;
    const price = found ? found.price : 0;
    const quantity = Number(item.quantity) || 1;
    const lineTotal = Number((price * quantity).toFixed(2));

    total += lineTotal;
    totalQuantity += quantity;

    return {
      id: item.id,
      title,
      price,
      quantity,
      total: lineTotal
    };
  });

  const newOrder = {
    id: nextOrderId++,
    userId,
    customerName,
    address,
    createdAt: new Date().toISOString(),
    products: detailedProducts,
    total: Number(total.toFixed(2)),
    totalProducts: detailedProducts.length,
    totalQuantity
  };

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.listen(PORT, () => {
  console.log(`Servidor ElectroHogar activo en puerto ${PORT}`);
});
