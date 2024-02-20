var express = require("express");
const app = require("../app");
var router = express.Router();
const localStrategy = require("passport-local");
const passport = require("passport");
const userModel = require("./users");
const postModel = require("./post");
const upload = require("./multer");
passport.use(new localStrategy(userModel.authenticate()));

// router.get("/", function (req, res, next) {
//   res.render("index", {nav: false, title: "Login", error: req.flash("error"),
//   });
// });

router.get("/", function (req, res, next) {
  res.render("regLog", {
    nav: false,
    title: "Login",
    error: req.flash("error"),
  });
});

// router.get("/register", function (req, res, next) {
//   res.render("register", { nav: false, title: "Register" });
// });

router.get("/forgetPass", function (req, res, next) {
  res.render("forgetPass", { nav: false, title: "Register" });
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  const posts = await postModel.find().populate("user");
  res.render("profile", { user, posts, nav: true, title: "Profile" });
});

router.get("/showfull", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate("user");
  res.render("showfull", { user, posts, nav: true, title: "PinCraft" });
});

router.get("/favourites", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await userModel.find().populate("favourites");
  const postIds = user.favourites.map((favourites) => favourites);
  if (postIds.length <= 0)
    res.render("favouritesEmpty", { nav: true, title: "Favorites" });
  postModel
    .find({ _id: { $in: postIds } })
    .populate("user")
    .then((posts) => {
      res.render("favorites", { user, posts, nav: true, title: "Favorites" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/favourites/post/:id", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.findOne({ _id: req.params.id });
  const id = user.favourites.indexOf(post._id);
  if (id === -1) {
    user.favourites.push(post._id);
  } else {
    user.favourites.splice(id, 1);
  }
  await user.save();
  res.redirect("/feed");
});

router.get("/favourites/:id", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.findOne({ _id: req.params.id });
  const id = user.favourites.indexOf(post._id);
  if (id === -1) {
    user.favourites.push(post._id);
  } else {
    user.favourites.splice(id, 1);
  }

  await user.save();
  res.redirect("/favourites");
});

router.get("/feed", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate("user");

  res.render("feed", { user, posts, nav: true, title: "Feed" });
});

router.get("/add", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("add", { user, nav: true, title: "Add" });
});

router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render("edit", {user, nav: true, title: "Edit" });
});

router.post("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const id = user._id;
  const updated = await userModel.findByIdAndUpdate(
    { _id: id },
    {
      $set: {
        username: req.body.username,
        email: req.body.email,
        fullname: req.body.fullname,
      },
    }
  );
  res.redirect('/profile')
});

router.post("/createpost",
  isLoggedIn,
  upload.single("postimage"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

router.post("/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.post("/register", function (req, res) {
  let userdata = new userModel(({ username, email, fullname } = req.body));
  userModel.register(userdata, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/feed");
    });
  });
});

router.post("/login",
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
