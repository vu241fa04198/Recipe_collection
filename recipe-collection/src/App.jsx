
import React, { useEffect, useState } from 'react';

function App() {

  // LOAD USERS
  const [users, setUsers] = useState(
    () => JSON.parse(localStorage.getItem('users')) || []
  );

  // LOAD RECIPES
  const [recipes, setRecipes] = useState(
    () => JSON.parse(localStorage.getItem('recipes')) || []
  );

  // LOGGED-IN USER
  const [loggedEmail, setLoggedEmail] = useState(
    () => localStorage.getItem('loggedEmail') || ''
  );

  const currentUser = users.find(
    user => user.email === loggedEmail
  );

  const [page, setPage] = useState(
    loggedEmail ? 'home' : 'login'
  );

  // REGISTRATION AND LOGIN FIELDS
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // PROFILE FIELDS
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  // RECIPE FIELDS
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // LOAD PROFILE DETAILS
  useEffect(() => {
    setProfileName(currentUser?.name || '');
    setProfileEmail(currentUser?.email || '');
  }, [loggedEmail, currentUser?.name, currentUser?.email]);

  // SAVE USERS
  const saveUsers = (data) => {
    setUsers(data);
    localStorage.setItem('users', JSON.stringify(data));
  };

  // SAVE RECIPES
  const saveRecipes = (data) => {
    setRecipes(data);
    localStorage.setItem('recipes', JSON.stringify(data));
  };

  // USER REGISTRATION
  const register = (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanEmail || !password) {
      alert('Please fill all fields');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (users.some(user => user.email === cleanEmail)) {
      alert('Email already registered');
      return;
    }

    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      password: password,
      favourites: []
    };

    saveUsers([...users, newUser]);

    alert('Registration successful! Please login.');

    setName('');
    setEmail('');
    setPassword('');
    setPage('login');
  };

  // USER LOGIN
  const login = (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    const user = users.find(
      u => u.email === cleanEmail && u.password === password
    );

    if (!user) {
      alert('Invalid email or password');
      return;
    }

    setLoggedEmail(user.email);
    localStorage.setItem('loggedEmail', user.email);

    setEmail('');
    setPassword('');
    setPage('home');

    alert('Login successful!');
  };

  // USER LOGOUT
  const logout = () => {
    setLoggedEmail('');
    localStorage.removeItem('loggedEmail');
    setPage('login');

    alert('Logged out successfully!');
  };

  // ADD RECIPE
  const addRecipe = (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !ingredients.trim() ||
      !instructions.trim()
    ) {
      alert('Please fill all recipe fields');
      return;
    }

    const newRecipe = {
      id: Date.now(),
      title: title.trim(),
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
      owner: currentUser.email,
      isPublic: isPublic
    };

    saveRecipes([...recipes, newRecipe]);

    setTitle('');
    setIngredients('');
    setInstructions('');
    setIsPublic(false);

    alert('Recipe added successfully!');
  };

  // DELETE OWN RECIPE - AUTHORIZATION
  const deleteRecipe = (id) => {
    const recipe = recipes.find(r => r.id === id);

    if (!recipe || recipe.owner !== currentUser.email) {
      alert('Access denied! You cannot delete this recipe.');
      return;
    }

    saveRecipes(recipes.filter(r => r.id !== id));

    // REMOVE DELETED RECIPE FROM FAVOURITES
    const updatedUsers = users.map(user => ({
      ...user,
      favourites: (user.favourites || []).filter(
        favId => favId !== id
      )
    }));

    saveUsers(updatedUsers);

    alert('Recipe deleted successfully!');
  };

  // ADD OR REMOVE FAVOURITES
  const toggleFavourite = (id) => {
    if (!currentUser) return;

    const favourites = currentUser.favourites || [];

    const updatedFavourites = favourites.includes(id)
      ? favourites.filter(favId => favId !== id)
      : [...favourites, id];

    const updatedUsers = users.map(user =>
      user.email === currentUser.email
        ? { ...user, favourites: updatedFavourites }
        : user
    );

    saveUsers(updatedUsers);
  };

  // UPDATE PROFILE - NAME AND EMAIL
  const updateProfile = (e) => {
    e.preventDefault();

    const newEmail = profileEmail.trim().toLowerCase();
    const newName = profileName.trim();

    if (!newName || !newEmail) {
      alert('Please fill all profile fields');
      return;
    }

    const oldEmail = currentUser.email;

    // CHECK DUPLICATE EMAIL
    const emailExists = users.some(
      user =>
        user.email === newEmail &&
        user.email !== oldEmail
    );

    if (emailExists) {
      alert('Email already registered. Please use another email.');
      return;
    }

    // UPDATE USER NAME AND EMAIL
    const updatedUsers = users.map(user =>
      user.email === oldEmail
        ? {
          ...user,
          name: newName,
          email: newEmail
        }
        : user
    );

    // UPDATE RECIPE OWNERSHIP
    const updatedRecipes = recipes.map(recipe =>
      recipe.owner === oldEmail
        ? { ...recipe, owner: newEmail }
        : recipe
    );

    saveUsers(updatedUsers);
    saveRecipes(updatedRecipes);

    // UPDATE CURRENT LOGIN EMAIL
    setLoggedEmail(newEmail);
    localStorage.setItem('loggedEmail', newEmail);

    alert('Profile updated successfully!');
  };

  // PERSONAL RECIPE COLLECTION
  const myRecipes = recipes.filter(
    recipe => recipe.owner === currentUser?.email
  );

  // PUBLIC RECIPES
  const publicRecipes = recipes.filter(
    recipe => recipe.isPublic
  );

  // FAVOURITE RECIPES
  const favouriteRecipes = recipes.filter(
    recipe => (currentUser?.favourites || []).includes(recipe.id)
  );

  // RECIPE CARD
  const RecipeCard = ({ recipe }) => {
    const isFavourite = (
      currentUser?.favourites || []
    ).includes(recipe.id);

    return (
      <div className="recipe-card">

        <h3>{recipe.title}</h3>

        <p>
          <b>Ingredients:</b> {recipe.ingredients}
        </p>

        <p>
          <b>Instructions:</b> {recipe.instructions}
        </p>

        <p>
          <b>Owner:</b> {recipe.owner}
        </p>

        <button onClick={() => toggleFavourite(recipe.id)}>
          {isFavourite
            ? 'Remove Favourite'
            : 'Add Favourite'}
        </button>

        {recipe.owner === currentUser?.email && (
          <button
            className="delete"
            onClick={() => deleteRecipe(recipe.id)}
          >
            Delete My Recipe
          </button>
        )}

      </div>
    );
  };

  // AUTHENTICATION CHECK
  if (!currentUser) {

    // REGISTRATION PAGE
    if (page === 'register') {
      return (
        <div className="auth-box">

          <h2>User Registration</h2>

          <form onSubmit={register}>

            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              Register
            </button>

          </form>

          <p>Already have an account?</p>

          <button onClick={() => setPage('login')}>
            Login
          </button>

        </div>
      );
    }

    // LOGIN PAGE
    return (
      <div className="auth-box">

        <h2>User Login</h2>

        <form onSubmit={login}>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <p>New user?</p>

        <button onClick={() => setPage('register')}>
          Register
        </button>

      </div>
    );
  }

  // MAIN APPLICATION
  return (
    <div>

      <header>

        <h1>Recipe Collection</h1>

        <nav>

          <button onClick={() => setPage('home')}>
            Home
          </button>

          <button onClick={() => setPage('profile')}>
            My Profile
          </button>

          <button onClick={() => setPage('favourites')}>
            Favourites
          </button>

          <button onClick={logout}>
            Logout
          </button>

        </nav>

      </header>

      <main>

        <h2>Welcome, {currentUser.name}!</h2>

        {/* HOME PAGE */}
        {page === 'home' && (
          <>

            <h2>Add Your Recipe</h2>

            <form className="recipe-form" onSubmit={addRecipe}>

              <input
                type="text"
                placeholder="Recipe Name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />

              <textarea
                placeholder="Enter Ingredients"
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                required
              />

              <textarea
                placeholder="Enter Instructions"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                required
              />

              <label className="share-label">

                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                />

                Share this recipe publicly

              </label>

              <button type="submit">
                Add Recipe
              </button>

            </form>

            <h2>My Personal Collection</h2>

            {myRecipes.length === 0 ? (
              <p>No personal recipes available.</p>
            ) : (
              myRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                />
              ))
            )}

            <h2>Public Recipes</h2>

            {publicRecipes.length === 0 ? (
              <p>No public recipes available.</p>
            ) : (
              publicRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                />
              ))
            )}

          </>
        )}

        {/* PROFILE PAGE */}
        {page === 'profile' && (
          <div className="profile-box">

            <h2>My Profile</h2>

            <form onSubmit={updateProfile}>

              <label>Name</label>

              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="Enter your name"
                required
              />

              <label>Email</label>

              <input
                type="email"
                value={profileEmail}
                onChange={e => setProfileEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />

              <button type="submit">
                Update Profile
              </button>

            </form>

          </div>
        )}

        {/* FAVOURITES PAGE */}
        {page === 'favourites' && (
          <>

            <h2>My Favourite Recipes</h2>

            {favouriteRecipes.length === 0 ? (
              <p>No favourite recipes available.</p>
            ) : (
              favouriteRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                />
              ))
            )}

          </>
        )}

      </main>

    </div>
  );
}

export default App;
