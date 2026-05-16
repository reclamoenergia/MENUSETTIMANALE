import { MainFoodGroup, RecipeMealCategory, RecipeTag, Unit } from "@prisma/client";

type RecipeIngredientInput = { ingredientId: string; quantity: number; unit: Unit };
export type SeedRecipe = { id:string; name:string; mealCategories:RecipeMealCategory[]; recipeTags:RecipeTag[]; regionalTags:string[]; mainFoodGroup:MainFoodGroup; prepTimeMinutes:number; cookTimeMinutes:number; canBePreparedDayBefore:boolean; suitableForChildren:boolean; isSideDish:boolean; nutritionPerStandardPortion:{kcal:number;proteinG:number;carbsG:number;fatG:number;sugarsG:number}; ingredients:RecipeIngredientInput[]; steps:string[] };

const quick=["family_friendly","quick"] as RecipeTag[];
const mk=(id:string,name:string,c:RecipeMealCategory[],g:MainFoodGroup,ing:RecipeIngredientInput[],kcal:number,isSideDish=false):SeedRecipe=>({id,name,mealCategories:c,recipeTags:quick,regionalTags:[],mainFoodGroup:g,prepTimeMinutes:10,cookTimeMinutes:15,canBePreparedDayBefore:true,suitableForChildren:true,isSideDish,nutritionPerStandardPortion:{kcal,proteinG:20,carbsG:30,fatG:12,sugarsG:6},ingredients:ing,steps:["Preparare ingredienti","Cuocere","Servire"]});

export const recipes: SeedRecipe[] = [
mk("br1","Yogurt greco 150 g con 4 biscotti",["breakfast"],"cheese",[{ingredientId:"yogurt",quantity:150,unit:"g"},{ingredientId:"biscotti_ringo",quantity:4,unit:"piece"}],300),
mk("br2","Latte e biscotti",["breakfast"],"cereals",[{ingredientId:"latte",quantity:220,unit:"ml"},{ingredientId:"biscotti_ringo",quantity:35,unit:"g"}],320),
mk("br3","Latte e cereali",["breakfast"],"cereals",[{ingredientId:"latte",quantity:220,unit:"ml"},{ingredientId:"cereali_colazione",quantity:40,unit:"g"}],330),
mk("br4","Pancake semplici con frutta",["breakfast"],"cereals",[{ingredientId:"farina",quantity:50,unit:"g"},{ingredientId:"uova",quantity:1,unit:"piece"},{ingredientId:"latte",quantity:120,unit:"ml"},{ingredientId:"banana",quantity:1,unit:"piece"}],360),
mk("sn1","panino con il prosciutto",["morning_snack"],"snack",[{ingredientId:"pane_integrale",quantity:60,unit:"g"},{ingredientId:"prosciutto_cotto",quantity:40,unit:"g"}],240),
mk("sn2","panino con il pomodoro",["morning_snack"],"snack",[{ingredientId:"pane_integrale",quantity:60,unit:"g"},{ingredientId:"pomodoro",quantity:80,unit:"g"}],180),
mk("sn3","banana",["morning_snack","afternoon_snack"],"fruit",[{ingredientId:"banana",quantity:1,unit:"piece"}],95),
mk("sn4","taralli",["morning_snack"],"snack",[{ingredientId:"taralli",quantity:35,unit:"g"}],160),
mk("sn5","carote",["morning_snack"],"vegetables",[{ingredientId:"carote",quantity:120,unit:"g"}],50),
mk("sn6","merendina",["morning_snack","afternoon_snack"],"snack",[{ingredientId:"merendina",quantity:1,unit:"piece"}],180),
mk("sn7","biscotti ringo",["morning_snack"],"snack",[{ingredientId:"biscotti_ringo",quantity:35,unit:"g"}],170),
mk("sn8","latte e cereali",["afternoon_snack"],"cereals",[{ingredientId:"latte",quantity:200,unit:"ml"},{ingredientId:"cereali_colazione",quantity:35,unit:"g"}],260),
mk("sn9","fagottini di bresaola con fiocchi di latte",["afternoon_snack"],"cheese",[{ingredientId:"bresaola",quantity:60,unit:"g"},{ingredientId:"fiocchi_di_latte",quantity:80,unit:"g"}],190),
mk("sn10","pancake con frutta",["afternoon_snack"],"cereals",[{ingredientId:"farina",quantity:45,unit:"g"},{ingredientId:"uova",quantity:1,unit:"piece"},{ingredientId:"latte",quantity:100,unit:"ml"},{ingredientId:"banana",quantity:1,unit:"piece"}],280),
mk("primo_pasta_integrale_pomodoro","Pasta integrale al pomodoro e basilico",["lunch","first_course"],"cereals",[{ingredientId:"pasta",quantity:85,unit:"g"},{ingredientId:"pomodoro",quantity:180,unit:"g"},{ingredientId:"basilico",quantity:5,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tsp"}],500),
mk("primo_riso_piselli","Riso con piselli e carote",["lunch","first_course"],"cereals",[{ingredientId:"riso",quantity:85,unit:"g"},{ingredientId:"piselli",quantity:90,unit:"g"},{ingredientId:"carote",quantity:80,unit:"g"}],500),
mk("primo_orzo_zucchine","Orzo con zucchine e parmigiano",["lunch","first_course"],"cereals",[{ingredientId:"riso",quantity:85,unit:"g"},{ingredientId:"zucchine",quantity:150,unit:"g"},{ingredientId:"parmigiano",quantity:12,unit:"g"}],510),
mk("primo_pasta_ceci","Pasta e ceci",["lunch","first_course"],"legumes",[{ingredientId:"pasta",quantity:80,unit:"g"},{ingredientId:"ceci_cotti",quantity:140,unit:"g"},{ingredientId:"cipolla",quantity:40,unit:"g"}],535),
mk("piatto_unico_riso_tonno","Insalata di riso con tonno e pomodoro",["lunch","single_dish"],"fish",[{ingredientId:"riso",quantity:80,unit:"g"},{ingredientId:"tonno_naturale",quantity:90,unit:"g"},{ingredientId:"pomodoro",quantity:120,unit:"g"}],510),
mk("piatto_unico_riso_pollo","Riso con pollo e zucchine",["lunch","single_dish"],"white_meat",[{ingredientId:"riso",quantity:80,unit:"g"},{ingredientId:"petto_pollo",quantity:130,unit:"g"},{ingredientId:"zucchine",quantity:140,unit:"g"}],535),
mk("piatto_unico_riso_lenticchie","Riso con lenticchie e zucca",["lunch","single_dish"],"legumes",[{ingredientId:"riso",quantity:80,unit:"g"},{ingredientId:"lenticchie_cotte",quantity:130,unit:"g"},{ingredientId:"zucca",quantity:150,unit:"g"}],520),
mk("piatto_unico_pasta_tonno","Pasta al tonno e limone",["lunch","single_dish"],"fish",[{ingredientId:"pasta",quantity:85,unit:"g"},{ingredientId:"tonno_naturale",quantity:85,unit:"g"},{ingredientId:"limone",quantity:20,unit:"g"}],520),
mk("secondo_pollo_limone","Petto di pollo al limone",["dinner","second_course"],"white_meat",[{ingredientId:"petto_pollo",quantity:160,unit:"g"},{ingredientId:"limone",quantity:30,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tbsp"}],390),
mk("secondo_merluzzo_forno","Merluzzo al forno",["dinner","second_course"],"fish",[{ingredientId:"merluzzo",quantity:170,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tbsp"},{ingredientId:"origano",quantity:1,unit:"tsp"}],320),
mk("secondo_frittata_spinaci","Frittata di spinaci",["dinner","second_course"],"eggs",[{ingredientId:"uova",quantity:2,unit:"piece"},{ingredientId:"spinaci",quantity:120,unit:"g"},{ingredientId:"parmigiano",quantity:10,unit:"g"}],340),
mk("secondo_tacchino_peperoni","Tacchino con peperoni",["dinner","second_course"],"white_meat",[{ingredientId:"fesa_tacchino",quantity:160,unit:"g"},{ingredientId:"peperoni",quantity:150,unit:"g"}],360),
mk("secondo_salmone_zucchine","Salmone in padella con zucchine",["dinner","second_course"],"fish",[{ingredientId:"salmone",quantity:160,unit:"g"},{ingredientId:"zucchine",quantity:150,unit:"g"}],420),
mk("secondo_uova_pomodoro","Uova al pomodoro",["dinner","second_course"],"eggs",[{ingredientId:"uova",quantity:2,unit:"piece"},{ingredientId:"pomodoro",quantity:180,unit:"g"}],290),
mk("secondo_polpette_bovine","Polpette bovine al forno",["dinner","second_course"],"red_meat",[{ingredientId:"macinato_bovino",quantity:150,unit:"g"},{ingredientId:"uova",quantity:1,unit:"piece"},{ingredientId:"farina",quantity:10,unit:"g"}],430),
mk("secondo_ceci_spinaci","Ceci in umido con spinaci",["dinner","second_course"],"legumes",[{ingredientId:"ceci_cotti",quantity:150,unit:"g"},{ingredientId:"spinaci",quantity:120,unit:"g"},{ingredientId:"cipolla",quantity:40,unit:"g"}],340),
mk("contorno_insalata_mista","Insalata di lattuga e pomodoro",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"insalata_lattuga",quantity:100,unit:"g"},{ingredientId:"pomodoro",quantity:90,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tsp"}],110,true),
mk("contorno_carote_vapore","Carote al vapore",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"carote",quantity:150,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tsp"}],120,true),
mk("contorno_zucchine_trifolate","Zucchine trifolate",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"zucchine",quantity:170,unit:"g"},{ingredientId:"aglio",quantity:5,unit:"g"}],100,true),
mk("contorno_patate_forno","Patate al forno",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"patate",quantity:180,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tbsp"}],210,true),
mk("contorno_broccoli_vapore","Broccoli al vapore",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"broccoli",quantity:170,unit:"g"}],80,true),
mk("contorno_melanzane_griglia","Melanzane grigliate",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"melanzane",quantity:170,unit:"g"},{ingredientId:"olio_evo",quantity:1,unit:"tsp"}],120,true),
mk("contorno_cavolfiore_lesso","Cavolfiore lesso",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"cavolfiore",quantity:170,unit:"g"}],75,true),
mk("contorno_fagiolini_vapore","Fagiolini al vapore",["side_dish","lunch","dinner"],"vegetables",[{ingredientId:"fagiolini",quantity:170,unit:"g"}],80,true)
];
