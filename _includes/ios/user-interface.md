# User Interface

At the end of the day, users of your app are going to be interacting with UIKit components.

ParseUI is an opensource collection of a handy user interface components aimed to streamline and simplify user authentication, displaying lists of data, and other common app elements.

ParseUI can be installed by leveraging Cocoapods 'subspecs', simply add `pod 'Parse/UI'` to your Podfile and run `pod install`. Once installed just use `import Parse` to use ParseUI. More details can be found on the official [GitHub page](https://github.com/parse-community/Parse-SDK-iOS-OSX#other-installation-options)

## PFLogInViewController

If you are using Parse to manage users in your mobile app, you are already familiar with the `PFUser` class. At some point in your app, you might want to present a screen to log in your `PFUser`. `ParseUI` provides a view controller that does exactly this:

You use the `PFLogInViewController` class by instantiating it and presenting it modally:

<div class="language-toggle" markdown="1">
```objective_c
PFLogInViewController *logInController = [[PFLogInViewController alloc] init];
logInController.delegate = self;
[self presentViewController:logInController animated:YES completion:nil];
```
```swift
var logInController = PFLogInViewController()
logInController.delegate = self
self.present(logInController, animated:true, completion: nil)
```
</div>

### Configuring the Log In Elements

<img alt="" data-echo="{{ '/assets/images/login_diagram.png' | prepend: site.baseurl }}"/>

`PFLogInViewController` can be configured to provide a variety of log in options. By default, `PFLogInViewController` presents the following UI:

*   Username and Password Fields
*   Log In Button
*   Password Forgotten Button
*   Sign Up Button
*   Dismiss Button

Any of the above features can be turned on or off. The options can be set using the `fields` property on `PFLogInViewController`:

<div class="language-toggle" markdown="1">
```objective_c
  logInController.fields = (PFLogInFieldsUsernameAndPassword
                           | PFLogInFieldsLogInButton
                           | PFLogInFieldsSignUpButton
                           | PFLogInFieldsPasswordForgotten
                           | PFLogInFieldsDismissButton);
```
```swift
logInController.fields = [PFLogInFields.usernameAndPassword,
                          PFLogInFields.logInButton,
                          PFLogInFields.signUpButton,
                          PFLogInFields.passwordForgotten,
                          PFLogInFields.dismissButton]
```
</div>

Essentially, you create an array of all the options you want to include in the log in screen, and assign the value to `fields`.

In addition, there are a number of other options that can be turned on, including:

*   Facebook Button
*   Twitter Button

Similarly, you can turn on Facebook or Twitter log in as such:

<div class="language-toggle" markdown="1">
```objective_c
logInController.fields = (PFLogInFieldsUsernameAndPassword
                          | PFLogInFieldsFacebook
                          | PFLogInFieldsTwitter);
```
```swift
logInController.fields = [PFLogInFields.usernameAndPassword,
                          PFLogInFields.facebook,
                          PFLogInFields.twitter]
```
</div>

The above code would produce a log in screen that includes username, password, Facebook and Twitter buttons. Facebook log in permissions can be set via the `facebookPermissions`.

<div class="language-toggle" markdown="1">
```objective_c
PFLogInViewController *logInController = [[PFLogInViewController alloc] init];
logInController.delegate = self;
logInController.facebookPermissions = @[ @"friends_about_me" ];
[self presentViewController:logInController animated:YES completion:nil];
```
```swift
var logInController = PFLogInViewController()
logInController.delegate = self
logInController.facebookPermissions = [ "friends_about_me" ]
self.present(logInController, animated:true, completion:nil)
```
</div>

### Responding to Log In Success, Failure or Cancellation

When the user signs in or cancels, the `PFLogInViewController` notifies the delegate of the event. Upon receiving this callback, the delegate should, at a minimum, dismiss `PFLogInViewController`. Additionally, the delegate could possibly update its own views or forward the message to the other components that need to know about the `PFUser`.

<div class="language-toggle" markdown="1">
```objective_c
- (void)logInViewController:(PFLogInViewController *)controller
               didLogInUser:(PFUser *)user {
    [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)logInViewControllerDidCancelLogIn:(PFLogInViewController *)logInController {
    [self dismissViewControllerAnimated:YES completion:nil];
}
```
```swift
func logInViewController(controller: PFLogInViewController, didLogInUser user: PFUser!) -> Void {
	self.dismiss(animated: true, completion: nil)
}

func logInViewControllerDidCancelLog(in controller: PFLogInViewController) -> Void {
	self.dismiss(animated: true, completion: nil)
}
```
</div>

Besides the delegate pattern, the `PFLogInViewController` also supports `NSNotification`s, which is useful if there are multiple observers of the sign in events.

### Customizing the Logo and Background Image

You might want to use your own logo or background image. You can achieve this by subclassing `PFLogInViewController` and overriding `viewDidLoad` method:

<div class="language-toggle" markdown="1">
```objective_c
@interface MyLogInViewController : PFLogInViewController

@end

@implementation MyLogInViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.view.backgroundColor = [UIColor darkGrayColor];

    UIImageView *logoView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"logo.png"]];
    self.logInView.logo = logoView; // logo can be any UIView
}
@end
```
```swift
class MyLogInViewController: PFLogInViewController {

  override func viewDidLoad() {
    super.viewDidLoad()

    self.view.backgroundColor = .darkGray

		let logoView = UIImageView(image: UIImage(named:"logo.png"))
		self.logInView?.logo = logoView
  }

}
```
</div>

If you would like to modify the logo and the background of the associated sign up view, you will need to subclass `PFSignUpViewController` and create an instance of the subclass and assign it to the `signUpController` as soon as you instantiate `PFLogInViewController`:

<div class="language-toggle" markdown="1">
```objective_c
MyLogInViewController *logInController = [[MyLogInViewController alloc] init];
logInController.signUpController = [[MySignUpViewController alloc] init];
[self presentViewController:logInController animated:YES completion:nil];
```
```swift
let logInController = MyLogInViewController()
logInController.signUpController = MySignUpViewController()
self.present(logInController, animated: true, completion: nil)
```
</div>

### Further View Customization

Occasionally you might want to customize `PFLogInViewController` further. For example, you might want to change the placeholder text to "Email" or change the size of the login button. In both cases, you need to subclass `PFLogInViewController` and override either `viewDidLoad` or `viewDidLayoutSubviews`. Override the former if the behavior is not related to layout, and override the latter otherwise:

<div class="language-toggle" markdown="1">
```objective_c
@interface MyLogInViewController : PFLogInViewController

@end

@implementation MyLogInViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.logInView.usernameField.placeholder = @"email";
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    self.logInView.logInButton.frame = CGRectMake(...); // Set a different frame.
}

@end
```
```swift
class MyLogInViewController : PFLogInViewController {

  override func viewDidLoad() {
    super.viewDidLoad()

    self.logInView.usernameField.placeholder = "email"
  }

  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()

    self.logInView.logInButton.frame = CGRectMake(...) // Set a different frame.
  }

}
```
</div>

Developers interested in this kind of customization should take a look at the interface of [`PFLogInView`](http://parseplatform.org/Parse-SDK-iOS-OSX/api/Classes/PFLogInView.html), where all customizable properties are documented.

### Portrait and Landscape

By default, the `PFLogInViewController` supports all orientations on iPad and `UIInterfaceOrientationPortrait` on iPhone.

### Resolution Independent

The `PFLogInViewController` is written to be resolution-independent, meaning it looks great on all iOS device sizes and pixel densities.

## PFSignUpViewController

If you are using `PFLogInViewController` with the `PFLogInFieldsSignUpButton` option enabled, you do not need to do any additional work to enable the sign up functionality. When your user taps on the sign up button on the log in screen, a sign up screen will appear and allow them to sign up. However, there are occasions where you might want to use the sign up screen independently of the log in screen. This is when the `PFSignUpViewController` comes in handy.

You use `PFSignUpViewController` by instantiating it and presenting it modally:

<div class="language-toggle" markdown="1">
```objective_c
PFSignUpViewController *signUpController = [[PFSignUpViewController alloc] init];
signUpController.delegate = self;
[self presentViewController:signUpController animated:YES completion:nil];
```
```swift
let signUpController = PFSignUpViewController()
signUpController.delegate = self
self.present(signUpController, animated: true, completion: nil)
```
</div>

That is all you need to do to get a functional sign up screen.

### Configuring the Sign Up Elements

<img alt="" data-echo="{{ '/assets/images/signup_diagram.png' | prepend: site.baseurl }}"/>

`PFSignUpViewController` can be configured to provide a variety of sign up options. By default, it presents the following UI:

*   Username and Password Fields
*   Email
*   Sign Up Button
*   Dismiss Button

If your sign up screen requires an additional field on top of the default ones, such as "phone number", you can turn on a field called named "additional":

<div class="language-toggle" markdown="1">
```objective_c
signUpController.fields = (PFSignUpFieldsUsernameAndPassword
                          | PFSignUpFieldsSignUpButton
                          | PFSignUpFieldsEmail
                          | PFSignUpFieldsAdditional
                          | PFSignUpFieldsDismissButton);
```
```swift
signUpController.fields = [.usernameAndPassword, .signUpButton, .email, .additional, .dismissButton]
```
</div>

Essentially, you create an array (in Swift), or use the bitwise or operator (for objective-c), to chain all of the options you want to include in the sign up screen, and assign the value to `fields`. Similarly, you can turn off any field by omitting it in the assignment to fields.

### Responding to Sign Up Success, Failure or Cancellation

When the user signs up or cancels, the `PFSignUpViewController` notifies the delegate of the event. Upon receiving this callback, the delegate should, at a minimum, dismiss `PFSignUpViewController`. Additionally, the delegate could update its own views or forward the message to the other components that need to know about the `PFUser`.

<div class="language-toggle" markdown="1">
```objective_c
- (void)signUpViewController:(PFSignUpViewController *)signUpController didSignUpUser:(PFUser *)user {
    [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)signUpViewControllerDidCancelSignUp:(PFSignUpViewController *)signUpController {
    [self dismissViewControllerAnimated:YES completion:nil];
}
```
```swift
func signUpViewController(signUpController: PFSignUpViewController, didSignUpUser user: PFUser) -> Void {
	self.dismiss(animated: true, completion: nil)
}

func signUpViewControllerDidCancelSignUp(signUpController: PFSignUpViewController) -> Void {
	self.dismiss(animated: true, completion: nil)
}
```
</div>

Besides the delegate pattern, the `PFSignUpViewController` also supports `NSNotification`s, which is useful when there are multiple listeners of the sign up events.

### Customizing the Logo and Background Image

You might want to use your own logo or background image. You can achieve this by subclassing `PFSignUpViewController` and overriding `viewDidLoad`:

<div class="language-toggle" markdown="1">
```objective_c
@interface MySignUpViewController : PFSignUpViewController

@end

@implementation MySignUpViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.view.backgroundColor = [UIColor darkGrayColor];

    UIImageView *logoView = [[UIImageView alloc] initWithImage:@"logo.png"];
    self.signUpView.logo = logoView; // logo can be any UIView
}

@end
```
```swift
class MySignUpViewController : PFSignUpViewController {

  override func viewDidLoad() {
    super.viewDidLoad()

    self.view.backgroundColor = .darkGray

		let logoView = UIImageView(image: UIImage(named: "logo.png"))
		self.signUpView?.logo = logoView // 'logo' can be any UIView
  }
}
```
</div>

### Customizing Validation Logic

Often you will want to run some client-side validation on the sign up information before submitting it to the Parse Cloud. You can add your validation logic in the `signUpViewController:shouldBeginSignUp:` method in the `PFSignUpViewControllerDelegate`. For example, if you decide any password less than 8 characters is too short, you can achieve the following with:

<div class="language-toggle" markdown="1">
```objective_c
- (BOOL)signUpViewController:(PFSignUpViewController *)signUpController
           shouldBeginSignUp:(NSDictionary *)info {
    NSString *password = info[@"password"];
    return (password.length >= 8); // prevent sign up if password has to be at least 8 characters long
}
```
```swift
func signUpViewController(_ signUpController: PFSignUpViewController,
													shouldBeginSignUp info: [String : String]) -> Bool {
	if let password = info["password"] {
		return password.utf16.count >= 8
	}
	return false
}
```
`info` is a dictionary that contains all sign up fields, such as username, password, email, and additional.

### Further View Customization

Occasionally you might want to customize `PFSignUpViewController` further. For example, you might want to change the "additional" placeholder text to "Phone" or change the size of the signup button. You can always subclass `PFSignUpViewController` and override `UIViewController`'s various methods. You should override the `viewDidLoad` if the behavior you want to change is unrelated to view layout, and override `viewDidLayoutSubviews` otherwise:

<div class="language-toggle" markdown="1">
```objective_c
@interface MySignUpViewController : PFSignUpViewController

@end

@implementation MySignUpViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.signUpView.usernameField.placeholder = @"phone";
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    self.signUpView.signUpButton.frame = CGRectMake(...); // Set a different frame.
}

@end
```
```swift
class MySignUpViewController : PFSignUpViewController {

  override func viewDidLoad() {
    super.viewDidLoad()

    self.signUpView?.usernameField?.placeholder = "phone"
  }

  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()

    self.signUpView?.signUpButton?.frame = CGRectMake(...) // Set a different frame.
  }

}
```
</div>

Developers interested in this kind of customization should take a look at the interface of [`PFSignUpView`](http://parseplatform.org/Parse-SDK-iOS-OSX/api/Classes/PFSignUpView.html), where all customizable properties are documented.

### Portrait and Landscape

By default, the `PFSignUpViewController` supports all orientations on iPad and `UIInterfaceOrientationPortrait` on iPhone.

### Resolution Independent

The `PFSignUpViewController` is written to be resolution-independent, meaning it looks great on all iOS device sizes and pixel densities.

## PFQueryTableViewController

Data oriented iOS applications are mostly a collection of `UITableViewController`s and corresponding `UITableView`s. When using Parse, each cell of a `UITableView` typically represents data from a `PFObject`. `PFQueryTableViewController` is a sub-class of `UITableViewController` that provides a layer of abstraction that lets you easily display data from one of your Parse classes.

You use `PFQueryTableViewController` much like how you would use `UITableViewController`:

1.  Make a subclass of `PFQueryTableViewController` and customize it. Use the [template file](https://gist.github.com/ba03c1a550f14f88f95d) as a starting point.
2.  It automatically sets itself as the delegate and datasource.
3.  Set the `parseClassName` instance variable to specify which Parse class should be queried for data.
4.  Override the `queryForTable` method to construct a custom `PFQuery` that should be used to get objects for the table.
5.  Override the `tableView:cellForRowAtIndexPath:object:` method to return a custom cell tailored for each `PFObject`.
6.  Implement your custom cell class; makes sure it inherits from `PFTableViewCell` class.
7.  When the view loads, the class automatically grabs the `PFObject`s via the constructed query and loads it into the table. It even includes pagination and pull-to-refresh out of the box.

The class allows you to think about a one-to-one mapping between a `PFObject` and a `UITableViewCell`, rather than having to juggle index paths. You also get the following features out of the box:

*   Pagination with a cell that can be tapped to load the next page.
*   Pull-to-refresh table view header.
*   Automatic downloading and displaying of remote images in cells.
*   Loading screen, shown before any data is loaded.
*   Automatic loading and management of the objects array.
*   Various methods that can be overridden to customize behavior at major events in the data cycle.

The easiest way to understand this class is with an example. This subclass of `PFQueryTableViewController` displays a series of Todo items and their numeric priorities:

<div class="language-toggle" markdown="1">
```objective_c
@interface SimpleTableViewController : PFQueryTableViewController

@end

@implementation SimpleTableViewController

- (instancetype)initWithStyle:(UITableViewStyle)style {
    self = [super initWithStyle:style];
    if (self) { // This table displays items in the Todo class
      self.parseClassName = @"Todo";
      self.pullToRefreshEnabled = YES;
      self.paginationEnabled = YES;
      self.objectsPerPage = 25;
    }
    return self;
}

- (PFQuery *)queryForTable {
    PFQuery *query = [PFQuery queryWithClassName:self.parseClassName];

    // If no objects are loaded in memory, we look to the cache first to fill the table
    // and then subsequently do a query against the network.
    if (self.objects.count == 0) {
      query.cachePolicy = kPFCachePolicyCacheThenNetwork;
    }

    [query orderByDescending:@"createdAt"];

    return query;
}

- (UITableViewCell *)tableView:(UITableView *)tableView  
         cellForRowAtIndexPath:(NSIndexPath *)indexPath
                        object:(PFObject *)object {
    static NSString *cellIdentifier = @"cell";

    PFTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier];
    if (!cell) {
      cell = [[PFTableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle
                                    reuseIdentifier:cellIdentifier];
    }

    // Configure the cell to show todo item with a priority at the bottom
    cell.textLabel.text = object[@"text"];
    cell.detailTextLabel.text = [NSString stringWithFormat:@"Priority: %@",  object[@"priority"]];

    return cell;
}

@end
```
```swift
class SimpleTableViewController: PFQueryTableViewController {

  override init(style: UITableView.Style, className: String?) {
    super.init(style: style, className: className)
    parseClassName = "Todo"
    pullToRefreshEnabled = true
    paginationEnabled = true
    objectsPerPage = 25
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
    parseClassName = "Todo"
    pullToRefreshEnabled = true
    paginationEnabled = true
    objectsPerPage = 25
  }

  override func queryForTable() -> PFQuery<PFObject> {
    let query = PFQuery(className: self.parseClassName!)

    // If no objects are loaded in memory, we look to the cache first to fill the table
    // and then subsequently do a query against the network.
    if self.objects!.count == 0 {
      query.cachePolicy = .cacheThenNetwork
    }

    query.order(byDescending: "createdAt")

    return query
  }

  func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath, object: PFObject?) -> PFTableViewCell? {
    let cellIdentifier = "cell"

    var cell = tableView.dequeueReusableCell(withIdentifier: cellIdentifier) as? PFTableViewCell
    if cell == nil {
      cell = PFTableViewCell(style: .subtitle, reuseIdentifier: cellIdentifier)
    }

    // Configure the cell to show todo item with a priority at the bottom
    if let object = object {
      cell!.textLabel?.text = object["text"] as? String
      let priority = object["priority"] as? String
      cell!.detailTextLabel?.text = "Priority \(String(describing: priority))"
    }

    return cell
  }
}
```
</div>

<img data-echo="{{ site.baseUrl }}/assets/images/todo_view.png" style="max-width:200px"/>

This view shows a list of Todo items and also allows the user to pull-to-refresh and load the next page by touching a special pagination cell at the end of the table. It also properly caches the objects such that  when the view is no longer in memory, the next time it loads it will use the query cache to immediately show the previously loaded objects while making a network call to update.

Notice all the code that we're not writing. We don't need to handle loading the data into the table, wrangle index paths, or handle tricky pagination code. That's all handled by the `PFQueryTableViewController` automatically.

A good starting point to learn more is to look at the [API for the class](http://parseplatform.org/Parse-SDK-iOS-OSX/api/Classes/PFQueryTableViewController.html) and also the [template subclass file](https://gist.github.com/ba03c1a550f14f88f95d). We designed the class with customizability in mind, so it should accommodate many instances where you used to use `UITableViewController`.

### Loading Remote Images in Cells

`PFQueryTableViewController` makes it simple to display remote images stored in the Parse Cloud as `PFFileObject`s. All you need to do is to override `tableView:cellForRowAtIndexPath:object:` and return a `PFTableViewCell` with its `imageView`'s `file` property specified. If you would like to display a placeholder image to be shown before the remote image is loaded, assign the placeholder image to the `image` property of the `imageView`.

<div class="language-toggle" markdown="1">
```objective_c
@implementation SimpleTableViewController

- (UITableViewCell *)tableView:(UITableView *)tableView  cellForRowAtIndexPath:(NSIndexPath *)indexPath object:(PFObject *)object {
    static NSString *identifier = @"cell";
    PFTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:identifier];
    if (!cell) { cell = [[PFTableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:identifier];
    }
    cell.textLabel.text = object[@"title"];

    PFFileObject *thumbnail = object[@"thumbnail"];
    cell.imageView.image = [UIImage imageNamed:@"placeholder.jpg"];
    cell.imageView.file = thumbnail;
    return cell;
}
@end
```
```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath, object: PFObject?) -> PFTableViewCell? {
	let identifier = "cell"

	var cell = tableView.dequeueReusableCell(withIdentifier: identifier) as? PFTableViewCell
	if cell == nil {
		cell = PFTableViewCell(style: .default, reuseIdentifier: identifier)
	}

	if let object = object {
		cell?.textLabel?.text = object["title"] as? String
		cell?.imageView?.image = UIImage(named: "placeholder.jpg")
		cell?.imageView?.file = object["thumbnail"] as? PFFileObject
	}

	return cell
}
```
</div>

<img data-echo="{{ site.baseUrl }}/assets/images/images_table.png" style="max-width:200px"/>

This table shows a list of cute animal photos which are stored in the Parse Cloud, as `PFFileObject`s. "placeholder.jpg" is an image included in the application bundle which is shown before the animal photos are downloaded.

The images are downloaded on demand. As you scroll through the table, the images in the currently visible cells are downloaded. This just-in-time behavior is desirable because not only does it conserve bandwidth, it also ensures timely display of visible images. If a more aggressive loading behavior is desired, you can use the `loadInBackground` method on `imageView` to download the image.

### Customizing the Query

The default query is set to get objects from your class ordered by descending `createdAt`. To customize, simply override the `queryForTable` method to return your own `PFQuery`. The table will use this query when getting objects to display.

### Customizing the Cells

To customize the look of your table, override `tableView:cellForRowAtIndexPath:object:` to return a customized cell. Notice that this method is similar to the typical table data source method, but it includes the `PFObject` directly as a parameter.

You should no longer override `tableView:cellForRowAtIndexPath:`.

_Important:_ your table view cells should inherit from `PFTableViewCell`, rather than `UITableViewCell`. `PFTableViewCell` is a subclass of `UITableViewCell` that supports remote image loading. When used in `PFQueryTableViewController`, `PFTableViewCell`'s remote images would be automatically loaded.

### Lifecycle Methods

Several methods are exposed that are called at major events during the data lifecycle of the table. They are `objectsDidLoad:` and `objectsWillLoad`, which are called after the objects have loaded from the query, and right before the query is fired, respectively. You can override these to provide extra functionality during these events.

### Pagination

<img data-echo="{{ site.baseUrl }}/assets/images/pagination.png" style="max-width:200px"/>

Pagination ensures that the table only gets one page of objects at a time. You can customize how many objects are in a page by setting the `objectsPerPage` instance variable.

The query is automatically altered to apply pagination, and, when the table first loads, it only shows the first page of objects. A pagination cell appears at the bottom of the table which allows users to load the next page. You can customize this cell by overriding `tableView:cellForNextPageAtIndexPath:`

Pagination is turned on by default. If you want to turn it off, simply set `paginationEnabled` to `NO`.

### Pull to Refresh

<img data-echo="{{ site.baseUrl }}/assets/images/pull_to_refresh.png" style="max-width:200px"/>

Pull to Refresh is a feature that allows users to pull the table down and release to reload the data. Essentially, the first page of data is reloaded from your class and the table is cleared and updated with the data.

Pull to Refresh is turned on by default. If you want to turn it off, simply set `pullToRefreshEnabled` to `NO`.

### Loading View

A loading view is displayed when the table view controller is loading the first page of data. It is turned on by default, and can be turned off via the property `loadingViewEnabled`.

### Offline and Error Messages

When the user is offline or a Parse error was generated from a query, an alert can automatically be shown to the user. By default, this is turned on when using `PFQueryTableViewController`. If you want to turn this behavior off, you can do so using the methods `offlineMessagesEnabled` and `errorMessagesEnabled` on the `Parse` class.

## PFImageView

Many apps need to display images stored in the Parse Cloud as `PFFileObject`s. However, to load remote images with the built-in `UIImageView` involves writing many lines of boilerplate code. `PFImageView` simplifies this task:

<div class="language-toggle" markdown="1">
```objective_c
PFImageView *imageView = [[PFImageView alloc] init];
imageView.image = [UIImage imageNamed:@"..."]; // placeholder image
imageView.file = (PFFileObject *)someObject[@"picture"]; // remote image

[imageView loadInBackground];
```
```swift
let imageView = PFImageView()
imageView.image = UIImage(named: "...") // placeholder image
imageView.file = someObject.picture // remote image

imageView.loadInBackground()
```
</div>

If assigned to, the `image` property is used to display a placeholder before the remote image is downloaded. Note that the download does not start as soon as the `file` property is assigned to, but the loading only begins when `loadInBackground:` is called. The remote image is cached both in memory and on disc. If the image is found in cache, the call to `loadInBackground:` would return immediately.

## PFTableViewCell

Many apps need to display table view cells which contain images stored in the Parse Cloud as `PFFileObject`s. However, to load remote images with the built-in `UITableViewCell` involves writing many lines of boilerplate code. `PFTableViewCell` simplifies this task by exposing an `imageView` property of the type `PFImageView` that supports remote image loading:

<div class="language-toggle" markdown="1">
```objective_c
@implementation SimpleTableViewController

- (UITableViewCell *)tableView:(UITableView *)tableView  cellForRowAtIndexPath:(NSIndexPath *)indexPath object:(PFObject *)object {
    static NSString *identifier = @"cell";
    PFTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:identifier];
    if (!cell) { cell = [[PFTableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:identifier];
    }
    cell.textLabel.text = object[@"title"];

    PFFileObject *thumbnail = object[@"thumbnail"];
    cell.imageView.image = [UIImage imageNamed:@"placeholder.jpg"];
    cell.imageView.file = thumbnail;
    return cell;
}

@end
```
```swift
func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
	let identifier = "cell"
	var cell = tableView.dequeueReusableCell(withIdentifier: identifier) as? PFTableViewCell
	if cell == nil {
		cell = PFTableViewCell(style: .default, reuseIdentifier: identifier)
	}

	if let title = object["title"] as? String {
		cell!.textLabel.text = title
	}
	if let thumbnail = object["thumbnail"] as? PFFileObject {
		cell!.imageView?.image = UIImage(named: "placeholder.jpg")
		cell!.imageView.file = thumbnail
	}

	return cell!
}
```
</div>

Like `UITableViewCell`, `PFTableViewCell` supports the default layout styles. Unlike `UITableViewCell`, `PFTableViewCell`'s `imageView` property is of the type `PFImageView`, which supports downloading remote images in `PFFileObject`.

Although it can be used independently, `PFTableViewCell` really shines when used in `PFQueryTableViewController`. `PFQueryTableViewController` knows about `PFTableViewCell` and loads the images automatically. This behavior is discussed in detail in the documentation for `PFQueryTableViewController`.

## Customizing/Localizing String Resources

All strings in Parse's UI classes are customizable/localizable. The easiest way to customize a string is through the [default localization support](https://developer.apple.com/internationalization/) provided by iOS.

Say, for example, you would like to customize the loading message in the HUD of `PFSignUpViewController` that says "Loading..." Assume you have followed the localization guide and set up `Localizable.strings` in the `en.lproj` directory. In `Localizable.strings`, you can then enter:

```javascript
"Loading..." = "In progress";
```

That would customize the string to "In progress". The key on the left is the original string you want to customize, and the value on the right is the customized value.

Say, you would like to customize the error message in `PFSignUpViewController` that says "The email address "andrew@x" is invalid. Please enter a valid email." You are not sure how to enter this into `Localizable.strings` because it contains a variable.

Included in  the Parse SDK is a file named `Localizable.string` which includes all the localizable keys in the Parse framework. Browsing this file, developers can find the key for the string they would like to customize. You notice that the string `"The email address \"%@\" is invalid. Please enter a valid email."` is a key in the file. In your own `Localizable.strings`, you can then enter:

```javascript
"The email address \"%@\" is invalid. Please enter a valid email." = "Wrong email: \"%@\"";
```

The string is now customized.
