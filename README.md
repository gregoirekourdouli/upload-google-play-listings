# Upload Android Applications Title and Descriptions to the Play Store

This action will help you upload the title and descriptions of Android applications to the Google Play Console using the Google Play Developer API v3.
It DOES NOT upload the application release files (.apk or .aab)! To upload the app, use another action like [this one](https://github.com/marketplace/actions/upload-android-release-to-play-store).

## Inputs

| Input | Description | Value | Required |
| --- | --- | --- | --- |
| serviceAccountJson | The service account json private key file to authorize the upload request. Can be used instead of `serviceAccountJsonPlainText` to specify a file rather than provide a secret | A path to a valid `service-account.json` file | true (or serviceAccountJsonPlainText) |
| serviceAccountJsonPlainText | The service account json in plain text, provided via a secret, etc | The contents of your `service-account.json` | true (or serviceAccountJson) |
| packageName | The package name, or Application Id, of the app you are uploading | A valid package name, e.g. `com.example.myapp`. The packageName must already exist in the play console account, so make sure you upload a manual apk or aab first through the console | true |
| language | The language localization code (BCP-47 language tag) of the title and descriptions | A valid localization code managed by the Google Play Console. Check the available codes [here](https://support.google.com/googleplay/android-developer/answer/9844778?hl=en#zippy=%2Cview-list-of-available-languages) | true |
| title | A file containing the title of the app, in the `language` defined above | A valid text file | false |
| shortDescription | A file containing the short description of the app, in the `language` defined above | A valid text file | false |
| fullDescription | A file containing the full description of the app, in the `language` defined above | A valid text file | false |
| video | A file containing the URL of a promotional YouTube video for the app, in the `language` defined above | A valid text file | false |
| changesNotSentForReview | Indicates that the changes in this edit will not be reviewed until they are explicitly sent for review from the Google Play Console. Defaults to `false` | `true` or `false` | `false` |

## Example usage

The below example publishes the title and descriptions in italian of `MyApp` to Google Play.

```yaml
uses: gregoirekourdouli/upload-google-play-listings@v1.0.0
with:
  serviceAccountJsonPlainText: ${{ SERVICE_ACCOUNT_JSON }}
  packageName: com.example.MyApp
  language: it-IT
  title: title_it.txt
  shortDescription: short_description_it.txt
  fullDescription: full_description_it.txt
```

