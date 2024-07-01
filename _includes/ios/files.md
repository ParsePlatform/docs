# Files

## The PFFileObject

`PFFileObject` lets you store application files in the cloud that would otherwise be too large or cumbersome to fit into a regular `PFObject`. The most common use case is storing images but you can also use it for documents, videos, music, and any other binary data.

Getting started with `PFFileObject` is easy. First, you'll need to have the data in `NSData` form and then create a `PFFileObject` with it. In this example, we'll just use a string:

<div class="language-toggle" markdown="1">
```objective_c
NSData *data = [@"Working at Parse is great!" dataUsingEncoding:NSUTF8StringEncoding];
PFFileObject *file = [PFFileObject fileObjectWithName:@"resume.txt" data:data];
```
```swift
let str = "Working at Parse is great!"
let data = str.data(using: String.Encoding.utf8)
let file = PFFileObject(name:"resume.txt", data:data!)
```
</div>

Notice in this example that we give the file a name of `resume.txt`. There's two things to note here:

*   You don't need to worry about filename collisions. Each upload gets a unique identifier so there's no problem with uploading multiple files named `resume.txt`.
*   It's important that you give a name to the file that has a file extension. This lets Parse figure out the file type and handle it accordingly. So, if you're storing PNG images, make sure your filename ends with `.png`.

Next you'll want to save the file up to the cloud. As with `PFObject`, there are many variants of the `save` method you can use depending on what sort of callback and error handling suits you.

<div class="language-toggle" markdown="1">
```objective_c
[file saveInBackground];
```
```swift
file?.saveInBackground()
```
</div>

Finally, after the save completes, you can associate a `PFFileObject` onto a `PFObject` just like any other piece of data:

<div class="language-toggle" markdown="1">
```objective_c
PFObject *jobApplication = [PFObject objectWithClassName:@"JobApplication"]
jobApplication[@"applicantName"] = @"Joe Smith";
jobApplication[@"applicantResumeFile"] = file;
[jobApplication saveInBackground];
```
```swift
let jobApplication = PFObject(className:"JobApplication")
jobApplication["applicantName"] = "Joe Smith"
jobApplication["applicantResumeFile"] = file
jobApplication.saveInBackground()
```
</div>

Retrieving it back involves calling one of the `getData` variants on the `PFFileObject`. Here we retrieve the resume file off another JobApplication object:

<div class="language-toggle" markdown="1">
```objective_c
PFFileObject *applicantResume = anotherApplication[@"applicantResumeFile"];
NSData *resumeData = [applicantResume getData];
```
```swift
let applicantResume = annotherApplication["applicationResumeFile"] as PFFileObject
let resumeData = applicantResume.getData()
```
</div>

Just like on `PFObject`, you will most likely want to use the background version of `getData`.

## Images

You can easily store images by converting them to `NSData` and then using `PFFileObject`. Suppose you have a `UIImage` named `image` that you want to save as a `PFFileObject`:

<div class="language-toggle" markdown="1">
```objective_c
NSData *imageData = UIImagePNGRepresentation(image);
PFFileObject *imageFile = [PFFileObject fileObjectWithName:@"image.png" data:imageData];

PFObject *userPhoto = [PFObject objectWithClassName:@"UserPhoto"];
userPhoto[@"imageName"] = @"My trip to Hawaii!";
userPhoto[@"imageFile"] = imageFile;
[userPhoto saveInBackground];
```
```swift
let imageData = UIImagePNGRepresentation(image)
let imageFile = PFFileObject(name:"image.png", data:imageData)

var userPhoto = PFObject(className:"UserPhoto")
userPhoto["imageName"] = "My trip to Hawaii!"
userPhoto["imageFile"] = imageFile
userPhoto.saveInBackground()
```
</div>

Your `PFFileObject` will be uploaded as part of the save operation on the `userPhoto` object. It's also possible to track a `PFFileObject`'s [upload and download progress](#progress).

Retrieving the image back involves calling one of the `getData` variants on the `PFFileObject`. Here we retrieve the image file off another `UserPhoto` named `anotherPhoto`:

<div class="language-toggle" markdown="1">
```objective_c
PFFileObject *userImageFile = anotherPhoto[@"imageFile"];
[userImageFile getDataInBackgroundWithBlock:^(NSData *imageData, NSError *error) {
    if (!error) {
        UIImage *image = [UIImage imageWithData:imageData];
    }
}];
```
```swift
let userImageFile = anotherPhoto["imageFile"] as! PFFileObject
userImageFile.getDataInBackground { (imageData: Data?, error: Error?) in
    if let error = error {
        print(error.localizedDescription)
    } else if let imageData = imageData {
        let image = UIImage(data:imageData)
    }
}
```
</div>

## Progress

It's easy to get the progress of both uploads and downloads using `PFFileObject` using `saveInBackgroundWithBlock:progressBlock:` and `getDataInBackgroundWithBlock:progressBlock:` respectively. For example:

<div class="language-toggle" markdown="1">
```objective_c
NSData *data = [@"Working at Parse is great!" dataUsingEncoding:NSUTF8StringEncoding];
PFFileObject *file = [PFFileObject fileObjectWithName:@"resume.txt" data:data];
[file saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
  // Handle success or failure here ...
} progressBlock:^(int percentDone) {
  // Update your progress spinner here. percentDone will be between 0 and 100.
}];
```
```swift
let str = "Working at Parse is great!"
let data = str.data(using: String.Encoding.utf8)
let file = PFFileObject(name:"resume.txt", data:data!)
file?.saveInBackground({ (success: Bool, error: Error?) in
    // Handle success or failure here ...
}, progressBlock: { (percentDone: Int32) in
    // Update your progress spinner here. percentDone will be between 0 and 100.
})
```
</div>

## Deleting Files

If you know the name of a file you can delete it using the [REST API]({{site.baseUrl}}/rest/guide/#deleting-files). Your master key is required for this operation.

Note: Reguardless of the Parse Server storage configuration, deleting a `PFObject` with a `PFFileObject` does not delete the file itself meerly its reference. Additionally, Parse does **NOT** provide a way to find unreferenced file names in storage.
