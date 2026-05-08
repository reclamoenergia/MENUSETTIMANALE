import { MainFoodGroup, RecipeMealCategory, RecipeTag, Unit } from "@prisma/client";

type RecipeIngredientInput = { ingredientId: string; quantity: number; unit: Unit };
export type SeedRecipe = { id:string; name:string; mealCategories:RecipeMealCategory[]; recipeTags:RecipeTag[]; regionalTags:string[]; mainFoodGroup:MainFoodGroup; prepTimeMinutes:number; cookTimeMinutes:number; canBePreparedDayBefore:boolean; suitableForChildren:boolean; isSideDish:boolean; nutritionPerStandardPortion:{kcal:number;proteinG:number;carbsG:number;fatG:number;sugarsG:number}; ingredients:RecipeIngredientInput[]; steps:string[] };

const quick=["family_friendly","quick"] as RecipeTag[];
const mk=(id:string,name:string,c:RecipeMealCategory[],g:MainFoodGroup,ing:RecipeIngredientInput[],kcal:number,isSideDish=false):SeedRecipe=>({id,name,mealCategories:c,recipeTags:quick,regionalTags:[],mainFoodGroup:g,prepTimeMinutes:10,cookTimeMinutes:15,canBePreparedDayBefore:true,suitableForChildren:true,isSideDish,nutritionPerStandardPortion:{kcal,proteinG:20,carbsG:30,fatG:12,sugarsG:6},ingredients:ing,steps:["Preparare ingredienti","Cuocere","Servire"]});

export const recipes: SeedRecipe[] = [
mk("br1","Yogurt con mela e avena",["breakfast"],"cereals",[{ingredientId:"yogurt_bianco",quantity:170,unit:"g"},{ingredientId:"mela",quantity:1,unit:"piece"},{ingredientId:"avena",quantity:30,unit:"g"}],320),
mk("br2","Pane integrale con ricotta e miele",["breakfast"],"cheese",[{ingredientId:"pane_integrale",quantity:60,unit:"g"},{ingredientId:"ricotta",quantity:80,unit:"g"},{ingredientId:"miele",quantity:1,unit:"tbsp"}],340),
mk("br3","Porridge banana e latte",["breakfast"],"cereals",[{ingredientId:"avena",quantity:45,unit:"g"},{ingredientId:"latte",quantity:200,unit:"ml"},{ingredientId:"banana",quantity:1,unit:"piece"}],360),
mk("br4","Toast con mozzarella e pomodoro",["breakfast"],"cheese",[{ingredientId:"pane_integrale",quantity:60,unit:"g"},{ingredientId:"mozzarella",quantity:70,unit:"g"},{ingredientId:"pomodoro",quantity:100,unit:"g"}],330),
mk("br5","Uova strapazzate e pane",["breakfast"],"eggs",[{ingredientId:"uova",quantity:2,unit:"piece"},{ingredientId:"pane_integrale",quantity:50,unit:"g"}],310),
mk("br6","Pancake semplici",["breakfast"],"cereals",[{ingredientId:"farina",quantity:50,unit:"g"},{ingredientId:"uova",quantity:1,unit:"piece"},{ingredientId:"latte",quantity:120,unit:"ml"}],300),
mk("br7","Ricotta con pera e mandorle",["breakfast"],"fruit",[{ingredientId:"ricotta",quantity:100,unit:"g"},{ingredientId:"pera",quantity:1,unit:"piece"},{ingredientId:"mandorle",quantity:15,unit:"g"}],320),
mk("br8","Yogurt con fragole",["breakfast"],"fruit",[{ingredientId:"yogurt_bianco",quantity:170,unit:"g"},{ingredientId:"fragole",quantity:120,unit:"g"}],230),
mk("sn1","Mela e mandorle",["afternoon_snack"],"snack",[{ingredientId:"mela",quantity:1,unit:"piece"},{ingredientId:"mandorle",quantity:15,unit:"g"}],170),
mk("sn2","Yogurt bianco",["morning_snack"],"snack",[{ingredientId:"yogurt_bianco",quantity:125,unit:"g"}],90),
mk("sn3","Pane e marmellata",["afternoon_snack"],"snack",[{ingredientId:"pane_integrale",quantity:40,unit:"g"},{ingredientId:"marmellata",quantity:20,unit:"g"}],180),
mk("sn4","Banana",["morning_snack"],"fruit",[{ingredientId:"banana",quantity:1,unit:"piece"}],95),
mk("sn5","Ricotta e kiwi",["afternoon_snack"],"snack",[{ingredientId:"ricotta",quantity:70,unit:"g"},{ingredientId:"kiwi",quantity:1,unit:"piece"}],150),
mk("sn6","Arancia a spicchi",["morning_snack"],"fruit",[{ingredientId:"arancia",quantity:1,unit:"piece"}],80),
mk("sn7","Pane e mozzarella",["afternoon_snack"],"snack",[{ingredientId:"pane_integrale",quantity:40,unit:"g"},{ingredientId:"mozzarella",quantity:50,unit:"g"}],210),
mk("sn8","Yogurt con miele",["evening_snack"],"snack",[{ingredientId:"yogurt_bianco",quantity:125,unit:"g"},{ingredientId:"miele",quantity:1,unit:"tsp"}],100),
mk("lu1","Pasta al pomodoro e basilico",["lunch","first_course"],"cereals",[{ingredientId:"pasta_secca",quantity:90,unit:"g"},{ingredientId:"pomodoro",quantity:180,unit:"g"},{ingredientId:"basilico",quantity:5,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tbsp"}],520),
mk("lu2","Riso con piselli e carote",["lunch","first_course"],"cereals",[{ingredientId:"riso",quantity:85,unit:"g"},{ingredientId:"piselli",quantity:80,unit:"g"},{ingredientId:"carote",quantity:80,unit:"g"}],500),
mk("lu3","Pasta e ceci",["lunch","first_course"],"legumes",[{ingredientId:"pasta_secca",quantity:80,unit:"g"},{ingredientId:"ceci_cotti",quantity:130,unit:"g"},{ingredientId:"cipolla",quantity:40,unit:"g"}],540),
mk("lu4","Insalata di riso tonno e pomodoro",["lunch","single_dish"],"fish",[{ingredientId:"riso",quantity:80,unit:"g"},{ingredientId:"tonno_naturale",quantity:90,unit:"g"},{ingredientId:"pomodoro",quantity:120,unit:"g"}],510),
mk("lu5","Pasta ricotta e zucchine",["lunch","first_course"],"cheese",[{ingredientId:"pasta_secca",quantity:85,unit:"g"},{ingredientId:"ricotta",quantity:80,unit:"g"},{ingredientId:"zucchine",quantity:140,unit:"g"}],530),
mk("lu6","Riso lenticchie e zucca",["lunch","single_dish"],"legumes",[{ingredientId:"riso",quantity:80,unit:"g"},{ingredientId:"lenticchie_cotte",quantity:120,unit:"g"},{ingredientId:"zucca",quantity:150,unit:"g"}],520),
mk("lu7","Pasta al tonno e limone",["lunch","first_course"],"fish",[{ingredientId:"pasta_secca",quantity:85,unit:"g"},{ingredientId:"tonno_naturale",quantity:80,unit:"g"},{ingredientId:"limone",quantity:20,unit:"g"}],515),
mk("lu8","Riso con pollo e zucchine",["lunch","single_dish"],"white_meat",[{ingredientId:"riso",quantity:80,unit:"g"},{ingredientId:"petto_pollo",quantity:130,unit:"g"},{ingredientId:"zucchine",quantity:130,unit:"g"}],540),
mk("di1","Petto di pollo al limone",["dinner","second_course"],"white_meat",[{ingredientId:"petto_pollo",quantity:160,unit:"g"},{ingredientId:"limone",quantity:30,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tbsp"}],390),
mk("di2","Merluzzo al forno",["dinner","second_course"],"fish",[{ingredientId:"merluzzo",quantity:170,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tbsp"},{ingredientId:"origano",quantity:1,unit:"tsp"}],320),
mk("di3","Frittata di spinaci",["dinner","second_course"],"eggs",[{ingredientId:"uova",quantity:2,unit:"piece"},{ingredientId:"spinaci",quantity:120,unit:"g"},{ingredientId:"parmigiano",quantity:10,unit:"g"}],340),
mk("di4","Tacchino con peperoni",["dinner","second_course"],"white_meat",[{ingredientId:"fesa_tacchino",quantity:160,unit:"g"},{ingredientId:"peperoni",quantity:150,unit:"g"}],360),
mk("di5","Salmone in padella con zucchine",["dinner","second_course"],"fish",[{ingredientId:"salmone",quantity:160,unit:"g"},{ingredientId:"zucchine",quantity:150,unit:"g"}],420),
mk("di6","Uova al pomodoro",["dinner","second_course"],"eggs",[{ingredientId:"uova",quantity:2,unit:"piece"},{ingredientId:"pomodoro",quantity:180,unit:"g"}],290),
mk("di7","Polpette bovine al forno",["dinner","second_course"],"red_meat",[{ingredientId:"macinato_bovino",quantity:150,unit:"g"},{ingredientId:"uova",quantity:1,unit:"piece"},{ingredientId:"farina",quantity:10,unit:"g"}],430),
mk("di8","Ceci in umido con spinaci",["dinner","second_course"],"legumes",[{ingredientId:"ceci_cotti",quantity:150,unit:"g"},{ingredientId:"spinaci",quantity:120,unit:"g"},{ingredientId:"cipolla",quantity:40,unit:"g"}],340),
mk("sd1","Insalata di lattuga e pomodoro",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"insalata_lattuga",quantity:90,unit:"g"},{ingredientId:"pomodoro",quantity:90,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tsp"}],110,true),
mk("sd2","Carote al vapore",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"carote",quantity:150,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tsp"}],120,true),
mk("sd3","Zucchine trifolate",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"zucchine",quantity:170,unit:"g"},{ingredientId:"aglio",quantity:5,unit:"g"}],100,true),
mk("sd4","Patate al forno",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"patate",quantity:180,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tbsp"}],210,true),
mk("sd5","Broccoli al vapore",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"broccoli",quantity:170,unit:"g"}],80,true),
mk("sd6","Melanzane grigliate",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"melanzane",quantity:170,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tsp"}],120,true),
mk("sd7","Cavolfiore lesso",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"cavolfiore",quantity:170,unit:"g"}],75,true),
mk("sd8","Fagiolini al vapore",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"fagiolini",quantity:170,unit:"g"}],80,true)
];
