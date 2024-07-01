# Your Configuration

<noscript>
<p style='padding:8px;color:#fff;background:#f06;border-radius:4px;font-weight:bold'>Customization requires Javascript to be enabled!</p>
</noscript>
Customize our docs with your server configuration.

Note: `masterKey` overrides all permissions. Keep this secret.

Protocol:<br/>
<select id='parse-server-custom-protocol' class='custom-server-option' style='border:none' title='Set your access protocol here.' defaultval='https'>
    <option value='https'>https</option>
    <option value='http'>http</option>
</select><br/>
Domain:
<input id='parse-server-custom-url' class='custom-server-option' type='text' placeholder='your.domain.com, your.domain.com:1337' value='YOUR.PARSE-SERVER.HERE' defaultval='YOUR.PARSE-SERVER.HERE' title='Set your parse server domain here.' autocorrect='off' spellcheck='false'>
Mount Path:
<input id='parse-server-custom-mount' class='custom-server-option' type='text' placeholder='your-mount-path, /your-mount-path/' value='parse' defaultval='parse' title='Set your mount path here.' autocorrect='off' spellcheck='false'>
App Id:
<input id='parse-server-custom-appid' class='custom-server-option' type='text' placeholder='your-app-id-here' value='APPLICATION_ID' defaultval='APPLICATION_ID' title='Set your app id here.' autocorrect='off' spellcheck='false'>
Master Key:
<input id='parse-server-custom-masterkey' class='custom-server-option' type='text' placeholder='your-master-key-here' value='MASTER_KEY' defaultval='MASTER_KEY' title='Set your master key here.' autocorrect='off' spellcheck='false'>
Client Key:
<input id='parse-server-custom-clientkey' class='custom-server-option' type='text' placeholder='your-client-key-here' value='CLIENT_KEY' defaultval='CLIENT_KEY' title='Set your client key here here.' autocorrect='off' spellcheck='false'>
Rest API Key:
<input id='parse-server-custom-restapikey' class='custom-server-option' type='text' placeholder='your-rest-api-key-here' value='REST_API_KEY' defaultval='REST_API_KEY' title='Set your rest api key here here.' autocorrect='off' spellcheck='false'>

<input id='parse-server-custom-values-reset' class='custom-server-option' style='color:#000' type='button' value='Reset Values' title='Resets server values to their defaults.'>

- serverUrl: <code class="highlighter-rouge"><span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span></code>
- appId: <code class="highlighter-rouge"><span class="custom-parse-server-appid">APPLICATION_ID</span></code>
- masterKey: <code class="highlighter-rouge"><span class="custom-parse-server-masterkey">MASTER_KEY</span></code>
- clientKey: <code class="highlighter-rouge"><span class="custom-parse-server-clientkey">CLIENT_KEY</span></code>
- restApiKey: <code class="highlighter-rouge"><span class="custom-parse-server-restapikey">REST_API_KEY</span></code>
