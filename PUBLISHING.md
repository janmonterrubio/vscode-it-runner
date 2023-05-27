# PUBLISHING

Steps to publish.

For now, we use the `package` option:

1. https://code.visualstudio.com/api/working-with-extensions/publishing-extension#vsce


```
vsce package
# then check it locally
code --install-extension vscode-it-runner-VERSION.vsix
```