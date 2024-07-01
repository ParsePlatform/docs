# Files

## The ParseFile

`ParseFile` lets you store application files in the cloud that would otherwise be too large or cumbersome to fit into a regular `ParseObject`. The most common use case is storing images but you can also use it for documents, videos, music, and any other binary data.

Getting started with `ParseFile` is easy. First, you'll need to have the data in `byte[]` or `Stream` form and then create a `ParseFile` with it. In this example, we'll just use a string:

```cs
byte[] data = System.Text.Encoding.UTF8.GetBytes("Working at Parse is great!");
ParseFile file = new ParseFile("resume.txt", data);
```

Notice in this example that we give the file a name of `resume.txt`. There's two things to note here:

*   You don't need to worry about filename collisions. Each upload gets a unique identifier so there's no problem with uploading multiple files named `resume.txt`.
*   It's important that you give a name to the file that has a file extension. This lets Parse figure out the file type and handle it accordingly. So, if you're storing PNG images, make sure your filename ends with `.png`.

Next you'll want to save the file up to the cloud. As with `ParseObject`, you can call `SaveAsync` to save the file to Parse.

```cs
Task saveTask = file.SaveAsync();
```

Finally, after the save completes, you can assign a `ParseFile` into a `ParseObject` just like any other piece of data:

```cs
var jobApplication = new ParseObject("JobApplication");
jobApplication["applicantName"] = "Joe Smith";
jobApplication["applicantResumeFile"] = file;
Task saveTask = jobApplication.SaveAsync();
```

Retrieving it back involves downloading the resource at the `ParseFile`'s `Url`. Here we retrieve the resume file off another JobApplication object:

```cs
var applicantResumeFile = anotherApplication.Get<ParseFile>("applicantResumeFile");
var resumeTextRequest = new WWW(applicantResumeFile.Url.AbsoluteUri);
yield return resumeTextRequest;
string resumeText = resumeTextRequest.text;
```

## Progress

It's easy to get the progress of `ParseFile` uploads by passing a `Progress` object to `SaveAsync`. For example:

```cs
byte[] data = System.Text.Encoding.UTF8.GetBytes("Working at Parse is great!");
ParseFile file = new ParseFile("resume.txt", data);

Task saveTask = file.SaveAsync(new Progress<ParseUploadProgressEventArgs>(e => {
    // Check e.Progress to get the progress of the file upload
}));
```

You can delete files that are referenced by objects using the [REST API]({{ site.baseUrl }}/rest/guide/#deleting-files). You will need to provide the master key in order to be allowed to delete a file.

If your files are not referenced by any object in your app, it is not possible to delete them through the REST API. You may request a cleanup of unused files in your app's Settings page. Keep in mind that doing so may break functionality which depended on accessing unreferenced files through their URL property. Files that are currently associated with an object will not be affected.
