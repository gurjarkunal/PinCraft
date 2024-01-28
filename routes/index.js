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
  res.render("regLog", {nav: false, title: "Login", error: req.flash("error"),
  });
});

// router.get("/register", function (req, res, next) {
//   res.render("register", { nav: false, title: "Register" });
// });

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  res.render("profile", { user, nav: true, title: "Profile" });
});

// router.get("/show", isLoggedIn, async function (req, res, next) {
//   const user = await userModel
//     .findOne({ username: req.session.passport.user })
//     .populate("posts");
//   res.render("show", { user, nav: true, title: "All Pins" });
// });

router.get("/showfull", isLoggedIn, async function (req, res, next) {
  res.render("showfull", { nav: true, title: "My All Pins" });
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

router.post(
  "/createpost",
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

router.post(
  "/fileupload",
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
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
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
