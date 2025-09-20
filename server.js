import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = './data/recipes.json';

app.use(cors());
app.use(express.json());

// Helper function to read recipes from JSON file
async function readRecipes() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File not found, return empty array
      return [];
    }
    throw error;
  }
}

// Helper function to write recipes to JSON file
async function writeRecipes(recipes) {
  await fs.writeFile(DATA_FILE, JSON.stringify(recipes, null, 2));
}

// GET /api/recipes - Return all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await readRecipes();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Could not read recipes.' });
  }
});

// POST /api/recipes - Add new recipe
app.post('/api/recipes', async (req, res) => {
  const { title, ingredients, instructions, cookTime, difficulty } = req.body;

  // Validate required fields
  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ error: 'Title, ingredients, and instructions are required.' });
  }

  const newRecipe = {
    id: Date.now(),             // unique id using timestamp
    title,
    ingredients,
    instructions,
    cookTime: cookTime || '',
    difficulty: difficulty || 'medium',  // default difficulty
  };

  try {
    const recipes = await readRecipes();
    recipes.push(newRecipe);
    await writeRecipes(recipes);
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: 'Could not save recipe.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
