require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const Contact = require('../models/Contact');

const aboutData = {
    about: "\n        To make the brine, toast the peppercorns in a large pan on a high heat for 1 minute, then add the rest of the brine ingredients and 400ml of cold water. Bring to the boil, then leave to cool, topping up with another 400ml of cold water.\n    \n        Meanwhile, slash the chicken thighs a few times as deep as the bone, keeping the skin on for maximum flavour. Once the brine is cool, add all the chicken pieces, cover with clingfilm and leave in the fridge for at least 12 hours – I do this overnight.\n    \n        After brining, remove the chicken to a bowl, discarding the brine, then pour over the buttermilk, cover with clingfilm and place in the fridge for a further 8 hours, so the chicken is super-tender.\n    \n        When you’re ready to cook, preheat the oven to 190°C/375°F/gas 5.\n    \n        Wash the sweet potatoes well, roll them in a little sea salt, place on a tray and bake for 30 minutes.\n    \n        Meanwhile, make the pickle – toast the fennel seeds in a large pan for 1 minute, then remove from the heat. Pour in the vinegar, add the sugar and a good pinch of sea salt, then finely slice and add the cabbage. Place in the fridge, remembering to stir every now and then while you cook your chicken.\n    \n        Source: https://www.jamieoliver.com/recipes/chicken-recipes/southern-fried-chicken/",
    image: "crab-cakes.jpg",
}

/***** Get /Homepage */
exports.homepage = async(req, res) => {
    try {
        const limitNumber = 5
        const categories = await Category.find({}).limit(limitNumber)
        const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber)
        const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber)
        const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber)
        const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber)

        const food = { latest, thai, american, chinese }

        res.render('index', { title: 'Recipe Blog - Home', categories, food })
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }
    
}

/***** Get /Categories */
exports.exploreCategories = async(req, res) => {
    try {
        const limitNumber = 20
        const categories = await Category.find({}).limit(limitNumber)
        res.render('categories', { title: 'Recipe Blog - Home', categories })
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }   
}

/***** Get /CategoriesBYID */
exports.exploreCategoriesById = async(req, res) => {
    try {
        const categoryId = req.params.id
        const limitNumber = 20
        const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber)
        res.render('categories', { title: 'Recipe Blog - Home', categoryById })
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }   
}

/***** Get /Recipes */
exports.exploreRecipes = async(req, res) => {
    try {
        const recipeId = req.params.id
        const recipe = await Recipe.findById(recipeId);
        res.render('recipe', { title: 'Recipe Blog - Recipes', recipe })
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }   
}

/***** Post /searchRecipes */
exports.searchRecipe = async(req, res) => {
    try {
        const searchTerm = req.body.searchTerm
        const recipe = await Recipe.find({ $text: { $search: searchTerm, $diacriticSensitive: true }});
        res.render('search', { title: 'Recipe Blog - Recipes', recipe })
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }   
}

/***** Get /Explore Latest */
exports.exploreLatest = async(req, res) => {
    try {
        const limitNumber = 20
        const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
        res.render('explore-latest', { title: 'Recipe Blog - Recipes', recipe })
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }   
}

/***** Get /Explore Random */
exports.exploreRandom = async(req, res) => {
    try {
        let count = await Recipe.find().countDocuments();
        let random = Math.floor(Math.random() * count);
        let recipe = await Recipe.findOne().skip(random).exec();
        res.render('explore-random', { title: 'Recipe Blog - Recipes', recipe })
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred" });
    }   
}

/***** Get /Submit Recipe */
exports.submitRecipe = async(req, res) => {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit')
    res.render('submit-recipe', { title: 'Recipe Blog - Submit Recipe', infoErrorsObj, infoSubmitObj})
}

/***** Post /Submit Recipe */
exports.submitRecipeOnPost = async(req, res) => {
    try {

        let imageUploadFile, uploadPath, newImageName;

        if(!req.files || Object.keys(req.files).length === 0) {
            console.log('No files were uploaded.')
        }else {
            imageUploadFile = req.files.image;
            newImageName = Date.now() + imageUploadFile.name;

            uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

            imageUploadFile.mv(uploadPath, function(err) {
                if(err) return res.status(500).send(err)
            })
        }

        const newRecipe = new Recipe({
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            ingredients: req.body.ingredients,
            category: req.body.category,
            image: newImageName
        })

        await newRecipe.save();

        req.flash('infoSubmit', 'Recipe has been added successfully!')
        res.redirect('submit-recipe')
    } catch (error) {
        req.flash('infoErrors', error)
        res.redirect('submit-recipe')
    }
}

/***** Get /About Page */
exports.about = (req, res) => {  
    try {
        res.render('about', { title: 'Recipe Blog - About', aboutData})
    } catch (error) {
        res.status(500).send({ message: error.message || "Error Occurred"})
    }
}

/***** Post /Contact Page */
exports.contactOnPost = async(req, res) => {  
    try {

        const newContact = new Contact({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message
        })

        await newContact.save();

        req.flash('infoSubmit', 'Your message has been received successfully, thanks!')
        res.redirect('contact')
    } catch (error) {
        req.flash('infoErrors', error)
        res.redirect('contact')
    }
}

/***** Get /Contacts */
exports.contact = async(req, res) => {
    const limitNumber = 7
    const displayContact = await Contact.find({}).sort({ _id: -1 }).limit(limitNumber);
    // console.log(displayContact)
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit')
    res.render('contact', { title: 'Recipe Blog - Contact', infoErrorsObj, infoSubmitObj, displayContact})
}


async function deleteRecipe() {
    try {
        await Recipe.deleteOne({ name: 'New Chocolate Cake' });
    } catch (error) {
        console.log(error)
    }
}
deleteRecipe()

async function updateRecipe() {
    try {
        const res = await Recipe.updateOne({ name: 'New Recipe with Image' }, { name: 'New Recipe' });
        res.n;  //Number of documents matched
        res.nModified;  //Number of documents modified
    } catch (error) {
        console.log(error)
    }
}
updateRecipe()

// async function insertAboutPageData(){
//   try {
//     await About.insertMany([
//         {
//             "about": "\n        To make the brine, toast the peppercorns in a large pan on a high heat for 1 minute, then add the rest of the brine ingredients and 400ml of cold water. Bring to the boil, then leave to cool, topping up with another 400ml of cold water.\n    \n        Meanwhile, slash the chicken thighs a few times as deep as the bone, keeping the skin on for maximum flavour. Once the brine is cool, add all the chicken pieces, cover with clingfilm and leave in the fridge for at least 12 hours – I do this overnight.\n    \n        After brining, remove the chicken to a bowl, discarding the brine, then pour over the buttermilk, cover with clingfilm and place in the fridge for a further 8 hours, so the chicken is super-tender.\n    \n        When you’re ready to cook, preheat the oven to 190°C/375°F/gas 5.\n    \n        Wash the sweet potatoes well, roll them in a little sea salt, place on a tray and bake for 30 minutes.\n    \n        Meanwhile, make the pickle – toast the fennel seeds in a large pan for 1 minute, then remove from the heat. Pour in the vinegar, add the sugar and a good pinch of sea salt, then finely slice and add the cabbage. Place in the fridge, remembering to stir every now and then while you cook your chicken.\n    \n        Source: https://www.jamieoliver.com/recipes/chicken-recipes/southern-fried-chicken/",
//             "image": "crab-cakes.jpg",
//         }
//     ]);
//   } catch (error) {
//     console.log('err', + error)
//   }
// }

// insertAboutPageData();