# Installation

There are various ways to install and use this sdk. We'll elaborate on a couple here.
Note that the Parse PHP SDK requires PHP 5.4 or newer. It can also run on HHVM (recommended 3.0 or newer).

## Install with Composer

[Get Composer], the PHP package manager. Then create a composer.json file in
 your projects root folder, containing:

<pre><code class="json">
{
    "require": {
        "parse/php-sdk" : "1.4.*"
    }
}
</code></pre>

Run "composer install" to download the SDK and set up the autoloader,
and then require it from your PHP script:

<pre><code class="php">
require 'vendor/autoload.php';
</code></pre>

## Install with Git

You can clone down this sdk using your favorite github client, or via the terminal.

<pre><code class="bash">
git clone https://github.com/parse-community/parse-php-sdk.git
</code></pre>

You can then include the `autoload.php` file in your code to automatically load the Parse SDK classes.

<pre><code class="php">
require 'autoload.php';
</code></pre>

## Install with another method

If you downloaded this sdk using any other means you can treat it like you used the git method above.
Once it's installed you need only require the `autoload.php` to have access to the sdk.