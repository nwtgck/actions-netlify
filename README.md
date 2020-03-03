# actions-netlify
![build-test](https://github.com/nwtgck/actions-netlify/workflows/build-test/badge.svg)

GitHub Actions for deploying Netlify

<img src="doc_assets/deploy-url-comment.png" width="650">

Deploy URLs are commented on your pull requests and commit comments!

## Usage

```yaml
# .github/workflows/netlify.yml
name: Build and Deploy to Netlify
on:
  push:
  pull_request:
    types: [opened, synchronize]
jobs:
  build:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v2

      # Build to ./dist or other directory
      # ...

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.0
        with:
          publish-dir: './dist'
          production-branch: master
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: ${{ github.event.pull_request.title }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Required parameters
- `publish-dir` (e.g. "dist", "_site")
- `NETLIFY_AUTH_TOKEN`: [Personal access tokens](https://app.netlify.com/user/applications#personal-access-tokens) > New access token
- `NETLIFY_SITE_ID`: team page > your site > Settings > Site details > Site information > API ID 
  - NOTE: API ID is `NETLIFY_SITE_ID`.

### Optional parameters
- `production-branch` (e.g. "master")
- `github-token: ${{ secrets.GITHUB_TOKEN }}`
- `deploy-message` A custom deploy message to see on Netlify deployment (e.g. `${{ github.event.pull_request.title }}`)
