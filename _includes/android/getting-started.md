# Getting Started

Note that we support Android 4.0 and higher. You can also check out our [API Reference]({{ site.apis.android }}) for more detailed information about our SDK.

## Installation
**Step 1:** Download `Parse-SDK-Android`

## Dependency
Add this in your root `build.gradle` file (**not** your module `build.gradle` file):

```gradle
allprojects {
	repositories {
		...
		maven { url "https://jitpack.io" }
	}
}
```

Then, add the library to your project `build.gradle`
```gradle
dependencies {
    implementation "com.github.parse-community.Parse-SDK-Android:parse:latest.version.here"
}
```
with the latest version being [![](https://jitpack.io/v/parse-community/Parse-SDK-Android.svg)](https://jitpack.io/#parse-community/Parse-SDK-Android)

**Step 2:** Setup Parse
Initialize Parse using your server configuration:
```java
import com.parse.Parse;
import android.app.Application;

public class App extends Application {
  @Override
  public void onCreate() {
    super.onCreate();
    Parse.initialize(new Parse.Configuration.Builder(this)
      .applicationId("YOUR_APP_ID")
      // if defined
      .clientKey("YOUR_CLIENT_KEY")
      .server("http://localhost:1337/parse/")
      .build()
    );
  }
}
```

The custom `Application` class must be registered in `AndroidManifest.xml`:
```xml
 <application
   android:name=".App"
   ...>
   ...
 </application>
```

Note that if you are testing with a server using `http`, you will need to add `android:usesCleartextTraffic="true"` to your above `<application>` definition, but you should only do this while testing and should use `https` for your final product.
