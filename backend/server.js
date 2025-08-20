import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

//import config
import connectDB from './config/db.config.js';

//import routes
import pingRoute from './routes/ping.route.js'
import authRoute from './routes/auth.route.js';
import expenseRoute from "./routes/expense.route.js";
import categoryRoute from "./routes/category.route.js";


//Load environment variables
dotenv.config();

//Connect to database
connectDB();

const PORT = process.env.PORT || 5000;
const app = express();

// ───────── middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ───────── routes
app.use('/api/ping', pingRoute);
app.use('/api/auth', authRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/expenses', authRoute);

// ───────── default route
app.get('/', (_req, res) => res.send('Backend is up and connected to MongoDB!'));

//error handling
app.use((err, res, req, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Someting went wrong!",
    })
})

app.listen(PORT, () => console.log(`⚡  backend running on http://localhost:${PORT}`));

