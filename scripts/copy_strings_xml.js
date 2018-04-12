//!/usr/bin/env coffee
var STRINGS_XML, XmlBuilder, directoryExists, fs, googleservicesjson, parseXml, stringsXml;

fs = require('fs');

({
  parseString: parseXml,
  Builder: XmlBuilder
} = require('xml2js'));

directoryExists = function(path) {
  var e;
  try {
    return fs.statSync(path).isDirectory();
  } catch (error) {
    e = error;
    return false;
  }
};

if (directoryExists('platforms/android')) {
  console.log('workarround for https://github.com/arnesson/cordova-plugin-firebase/issues/142', process.cwd());
  //add google-service's client: client_info: mobilesdk_app_id
  googleservicesjson = require(process.cwd() + '/google-services.json');
  STRINGS_XML = 'platforms/android/res/values/strings.xml';
  stringsXml = fs.readFileSync(STRINGS_XML, {
    encoding: 'utf8'
  });
  parseXml(stringsXml, function(_fail, data) {
    var builder, found, i, len, ref, setall, string;
    if (_fail) {
      throw new Error(_fail);
    }
    setall = function(string = {}) {
      string.$.name = 'google_app_id';
      string.$.templateMergeStrategy = 'preserve';
      string.$.translatable = false;
      // is this actually always 0?
      string._ = googleservicesjson.client[0].client_info.mobilesdk_app_id;
      return string;
    };
    found = false;
    ref = data.resources.string;
    for (i = 0, len = ref.length; i < len; i++) {
      string = ref[i];
      if (string.$.name === 'google_app_id') {
        found = true;
        setall(string); // should be noop
        break;
      }
    }
    if (!found) {
      data.resources.string.push(setall());
    }
    builder = new XmlBuilder();
    return fs.writeFileSync(STRINGS_XML, builder.buildObject(data));
  });
}
