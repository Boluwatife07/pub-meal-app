import pancakesImg from '@/assets/pancakes.jpg';
import eggsBenedictImg from '@/assets/eggs-benedict.jpg';
import avocadoToastImg from '@/assets/avocado-toast.jpg';
import grilledSalmonImg from '@/assets/grilled-salmon.jpg';
import pastaCarbonara from '@/assets/pasta-carbonara.jpg';
import ribeyeSteak from '@/assets/ribeye-steak.jpg';
import chocolateLavaCake from '@/assets/chocolate-lava-cake.jpg';
import tiramisu from '@/assets/tiramisu.jpg';
import craftCocktail from '@/assets/craft-cocktail.jpg';
import freshOrangeJuice from '@/assets/fresh-orange-juice.jpg';

// New breakfast items
import blueberryPancakes from '@/assets/blueberry-pancakes.jpg';
import eggsBenedictNew from '@/assets/eggs-benedict-new.jpg';
import granolaBowl from '@/assets/granola-bowl.jpg';
import breakfastBurrito from '@/assets/breakfast-burrito.jpg';
import smokedSalmonBagel from '@/assets/smoked-salmon-bagel.jpg';
import steelCutOatmeal from '@/assets/steel-cut-oatmeal.jpg';
import belgianWaffles from '@/assets/belgian-waffles.jpg';
import breakfastSandwich from '@/assets/breakfast-sandwich.jpg';

// New lunch items
import grilledChickenCaesar from '@/assets/grilled-chicken-caesar.jpg';
import fishTacos from '@/assets/fish-tacos.jpg';
import quinoaBuddhaBowl from '@/assets/quinoa-buddha-bowl.jpg';
import mushroomBurger from '@/assets/mushroom-burger.jpg';
import lobsterRoll from '@/assets/lobster-roll.jpg';
import thaiCurryBowl from '@/assets/thai-curry-bowl.jpg';
import bbqPulledPork from '@/assets/bbq-pulled-pork.jpg';
import mediterraneanWrap from '@/assets/mediterranean-wrap.jpg';

// New dessert items
import newYorkCheesecake from '@/assets/new-york-cheesecake.jpg';
import applePie from '@/assets/apple-pie.jpg';
import pannaCotta from '@/assets/panna-cotta.jpg';
import chocolateBrownie from '@/assets/chocolate-brownie.jpg';
import lemonTart from '@/assets/lemon-tart.jpg';
import iceCreamSundae from '@/assets/ice-cream-sundae.jpg';

// New drink items
import espressoMartini from '@/assets/espresso-martini.jpg';
import houseRedWine from '@/assets/house-red-wine.jpg';
import houseWhiteWine from '@/assets/house-white-wine.jpg';
import craftBeerSelection from '@/assets/craft-beer-selection.jpg';
import mocktail from '@/assets/mocktail.jpg';
import artisanCoffee from '@/assets/artisan-coffee.jpg';
import greenSmoothie from '@/assets/green-smoothie.jpg';
import icedTea from '@/assets/iced-tea.jpg';

export const menuItemImages = {
  // Existing breakfast items
  'avocado-toast': avocadoToastImg,
  'french-omelette': eggsBenedictImg,
  'pancakes': pancakesImg,
  
  // New breakfast items
  'blueberry-pancakes': blueberryPancakes,
  'eggs-benedict': eggsBenedictNew,
  'granola-bowl': granolaBowl,
  'breakfast-burrito': breakfastBurrito,
  'smoked-salmon-bagel': smokedSalmonBagel,
  'steel-cut-oatmeal': steelCutOatmeal,
  'belgian-waffles': belgianWaffles,
  'breakfast-sandwich': breakfastSandwich,
  
  // Existing lunch items  
  'pan-seared-salmon': grilledSalmonImg,
  'truffle-risotto': pastaCarbonara,
  'grilled-salmon': grilledSalmonImg,
  'pasta-carbonara': pastaCarbonara,
  'ribeye-steak': ribeyeSteak,
  
  // New lunch items
  'grilled-chicken-caesar': grilledChickenCaesar,
  'fish-tacos': fishTacos,
  'quinoa-buddha-bowl': quinoaBuddhaBowl,
  'mushroom-burger': mushroomBurger,
  'lobster-roll': lobsterRoll,
  'thai-curry-bowl': thaiCurryBowl,
  'bbq-pulled-pork': bbqPulledPork,
  'mediterranean-wrap': mediterraneanWrap,
  
  // Existing dessert items
  'chocolate-soufflé': chocolateLavaCake,
  'crème-brûlée': tiramisu,
  'chocolate-lava-cake': chocolateLavaCake,
  'tiramisu': tiramisu,
  
  // New dessert items
  'new-york-cheesecake': newYorkCheesecake,
  'apple-pie': applePie,
  'panna-cotta': pannaCotta,
  'chocolate-brownie': chocolateBrownie,
  'lemon-tart': lemonTart,
  'ice-cream-sundae': iceCreamSundae,
  
  // Existing drinks
  'craft-old-fashioned': craftCocktail,
  'sommelier-wine-selection': freshOrangeJuice,
  'craft-cocktail': craftCocktail,
  'fresh-orange-juice': freshOrangeJuice,
  
  // New drinks
  'espresso-martini': espressoMartini,
  'house-red-wine': houseRedWine,
  'house-white-wine': houseWhiteWine,
  'craft-beer-selection': craftBeerSelection,
  'mocktail': mocktail,
  'artisan-coffee': artisanCoffee,
  'green-smoothie': greenSmoothie,
  'iced-tea': icedTea,
};

export const getMenuItemImage = (itemName: string): string => {
  const key = itemName.toLowerCase().replace(/\s+/g, '-');
  return menuItemImages[key as keyof typeof menuItemImages] || '';
};