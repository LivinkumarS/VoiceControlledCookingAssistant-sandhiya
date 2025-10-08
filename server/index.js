import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://voice-controlled-cooking-assistant-liart.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.post("/api/recipe", async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    // Try multiple free APIs with fallbacks
    let recipe =
      (await fetchFromMealDB(keyword)) ||
      (await fetchFromEdamam(keyword)) ||
      (await generateAIRecipe(keyword));

    res.json({
      recipe: formatRecipe(recipe),
      source: recipe.source || "generated",
    });
  } catch (error) {
    console.error("Recipe API error:", error);
    // Fallback to generated recipe
    const fallbackRecipe = generateAIRecipe(keyword);
    res.json({
      recipe: formatRecipe(fallbackRecipe),
      source: "generated",
    });
  }
});

// 1. The MealDB API (Free, no key required)
async function fetchFromMealDB(keyword) {
  try {
    const cleanedKeyword = cleanKeyword(keyword);

    // Try search by name first
    const searchResponse = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${cleanedKeyword}`
    );

    if (searchResponse.data.meals && searchResponse.data.meals.length > 0) {
      return {
        ...searchResponse.data.meals[0],
        source: "TheMealDB",
      };
    }

    // Try search by ingredient
    const ingredientResponse = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${cleanedKeyword}`
    );

    if (
      ingredientResponse.data.meals &&
      ingredientResponse.data.meals.length > 0
    ) {
      const detailedResponse = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${ingredientResponse.data.meals[0].idMeal}`
      );

      if (detailedResponse.data.meals) {
        return {
          ...detailedResponse.data.meals[0],
          source: "TheMealDB",
        };
      }
    }

    return null;
  } catch (error) {
    console.log("MealDB API failed:", error.message);
    return null;
  }
}

// 2. Smart AI-generated recipe fallback
function generateAIRecipe(keyword) {
  const ingredients = generateSmartIngredients(keyword);
  const instructions = generateSmartInstructions(keyword);

  return {
    strMeal: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Recipe`,
    strInstructions: instructions,
    strMealThumb: getDefaultImage(keyword),
    strCategory: categorizeRecipe(keyword),
    strArea: "International",
    ingredients: ingredients,
    source: "AI Generated",
    cookingTime: estimateCookingTime(keyword),
    difficulty: estimateDifficulty(keyword),
  };
}

// Helper functions
function cleanKeyword(keyword) {
  // Remove extra words and get to the core ingredient/recipe
  const words = keyword.toLowerCase().split(" ");

  // Common recipe types to prioritize
  const recipeTypes = [
    "omelette",
    "curry",
    "salad",
    "soup",
    "stir fry",
    "stir-fry",
    "pasta",
    "rice",
    "sandwich",
    "burger",
  ];

  // Find recipe type first
  for (const type of recipeTypes) {
    if (keyword.toLowerCase().includes(type)) {
      return type;
    }
  }

  // Otherwise return the main ingredient (first word)
  return words[0];
}

function generateSmartIngredients(keyword) {
  const commonBases = {
    omelette: [
      "3 large eggs",
      "1 tbsp milk or water",
      "Salt and pepper to taste",
      "1 tbsp butter or oil",
    ],
    curry: [
      "500g main protein/vegetables",
      "1 onion, finely chopped",
      "2 garlic cloves, minced",
      "1 tbsp curry powder",
      "200ml coconut milk",
      "1 tbsp oil",
    ],
    salad: [
      "Mixed greens or base vegetable",
      "1 tbsp olive oil",
      "1 tsp lemon juice or vinegar",
      "Salt and pepper to taste",
      "Optional: herbs, nuts, cheese",
    ],
    soup: [
      "500g main ingredient",
      "1 liter vegetable/chicken stock",
      "1 onion, chopped",
      "2 garlic cloves",
      "1 tbsp oil",
      "Herbs and spices to taste",
    ],
    pasta: [
      "200g pasta",
      "2L water for boiling",
      "1 tbsp salt",
      "Sauce ingredients based on recipe",
      "Grated cheese for serving",
    ],
    rice: [
      "1 cup rice",
      "2 cups water",
      "1 tbsp oil or butter",
      "Salt to taste",
      "Additional ingredients as per recipe",
    ],
  };

  const lowerKeyword = keyword.toLowerCase();

  // Find matching base
  for (const [base, ingredients] of Object.entries(commonBases)) {
    if (lowerKeyword.includes(base)) {
      // Add the specific ingredient from the keyword
      const specificIngredient = keyword.split(" ")[0];
      if (!lowerKeyword.includes(specificIngredient.toLowerCase())) {
        ingredients.unshift(`200g ${specificIngredient}`);
      }
      return ingredients;
    }
  }

  // Default ingredients
  return [
    `200g ${keyword.split(" ")[0]}`,
    "1 tbsp oil or butter",
    "Salt and pepper to taste",
    "Your choice of herbs and spices",
    "Additional ingredients as desired",
  ];
}

function generateSmartInstructions(keyword) {
  const baseInstructions = {
    omelette: `1. Crack eggs into a bowl, add milk, salt, and pepper. Whisk until frothy.
2. Heat butter in a non-stick pan over medium heat.
3. Pour egg mixture into the pan.
4. Cook for 2-3 minutes until edges set, then flip or fold.
5. Cook for another minute until fully set.
6. Serve immediately with your favorite sides.`,

    curry: `1. Heat oil in a large pan over medium heat.
2. Add onions and garlic, sauté until fragrant.
3. Add main ingredient and cook until slightly browned.
4. Stir in curry powder and cook for 1 minute.
5. Pour in coconut milk, bring to simmer.
6. Cook for 15-20 minutes until sauce thickens.
7. Season with salt and pepper, serve with rice.`,

    salad: `1. Wash and prepare all vegetables.
2. Chop ingredients into bite-sized pieces.
3. Prepare dressing by whisking oil, acid, and seasonings.
4. Combine all ingredients in a large bowl.
5. Toss gently with dressing.
6. Serve immediately for best freshness.`,
  };

  const lowerKeyword = keyword.toLowerCase();

  for (const [type, instructions] of Object.entries(baseInstructions)) {
    if (lowerKeyword.includes(type)) {
      return instructions;
    }
  }

  // Default instructions
  return `1. Prepare all ingredients by washing and chopping as needed.
2. Heat oil in a pan over medium heat.
3. Cook main ingredients until tender and flavorful.
4. Add seasonings and adjust to taste.
5. Cook until all ingredients are well combined and heated through.
6. Serve hot and enjoy your delicious ${keyword}!`;
}

function categorizeRecipe(keyword) {
  const categories = {
    omelette: "Breakfast",
    pancake: "Breakfast",
    salad: "Side Dish",
    soup: "Starter",
    curry: "Main Course",
    pasta: "Main Course",
    rice: "Main Course",
    sandwich: "Lunch",
    burger: "Lunch",
    cake: "Dessert",
    cookie: "Dessert",
  };

  const lowerKeyword = keyword.toLowerCase();
  for (const [key, category] of Object.entries(categories)) {
    if (lowerKeyword.includes(key)) {
      return category;
    }
  }

  return "Main Course";
}

function estimateCookingTime(keyword) {
  const times = {
    omelette: "10 minutes",
    salad: "15 minutes",
    sandwich: "10 minutes",
    soup: "30 minutes",
    curry: "45 minutes",
    pasta: "20 minutes",
    rice: "25 minutes",
  };

  const lowerKeyword = keyword.toLowerCase();
  for (const [key, time] of Object.entries(times)) {
    if (lowerKeyword.includes(key)) {
      return time;
    }
  }

  return "30 minutes";
}

function estimateDifficulty(keyword) {
  const difficulties = {
    omelette: "Easy",
    salad: "Easy",
    sandwich: "Easy",
    soup: "Medium",
    pasta: "Easy",
    rice: "Easy",
    curry: "Medium",
  };

  const lowerKeyword = keyword.toLowerCase();
  for (const [key, difficulty] of Object.entries(difficulties)) {
    if (lowerKeyword.includes(key)) {
      return difficulty;
    }
  }

  return "Medium";
}

function getDefaultImage(keyword) {
  const images = {
    omelette:
      "https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg",
    curry: "https://www.themealdb.com/images/media/meals/gpz67p1560458984.jpg",
    salad: "https://www.themealdb.com/images/media/meals/wvqpwt1468339226.jpg",
    soup: "https://www.themealdb.com/images/media/meals/1529446133.jpg",
    pasta: "https://www.themealdb.com/images/media/meals/xr0n4r1576788363.jpg",
    rice: "https://www.themealdb.com/images/media/meals/1520081754.jpg",
  };

  const lowerKeyword = keyword.toLowerCase();
  for (const [key, image] of Object.entries(images)) {
    if (lowerKeyword.includes(key)) {
      return image;
    }
  }

  return "https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg"; // Default food image
}

function formatRecipe(recipe) {
  if (!recipe) return "No recipe found for your request.";

  let formatted = `🍳 ${recipe.strMeal}\n\n`;
  formatted += `📁 Category: ${recipe.strCategory} | 🌍 Cuisine: ${recipe.strArea}\n\n`;

  if (recipe.cookingTime) {
    formatted += `⏱️ Cooking Time: ${recipe.cookingTime} | 📊 Difficulty: ${
      recipe.difficulty || "Medium"
    }\n\n`;
  }

  formatted += `📝 INGREDIENTS:\n`;
  const ingredients = formatIngredients(recipe);
  ingredients.forEach((ingredient) => {
    formatted += `• ${ingredient}\n`;
  });

  formatted += `\n👨‍🍳 INSTRUCTIONS:\n${recipe.strInstructions}`;

  if (recipe.source) {
    formatted += `\n\n🔗 Source: ${recipe.source}`;
  }

  return formatted;
}

function formatIngredients(recipe) {
  if (recipe.ingredients) {
    return recipe.ingredients;
  }

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure} ${ingredient}`);
    }
  }
  return ingredients;
}

app.listen(5000, () => {
  console.log("Listening");
});
