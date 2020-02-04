# actions-netlify
GitHub Actions for deploying Netlify

## Usage

```yaml
# .github/workflows/netlify.yml

jobs:
  build:
    runs-on: ubuntu-18.04

    steps:
      # Build to ./dist
      # ...

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@develop
        with:
          publish-dir: './dist'
          github-token: ${{ secrets.GITHUB_TOKEN }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

- To get `NETLIFY_AUTH_TOKEN`, go <https://app.netlify.com/user/applications#personal-access-tokens>
- To get `NETLIFY_SITE_ID`, go team page > your site > Settings > Site details > Site information > API ID
  - NOTE: API ID is `NETLIFY_SITE_ID`.
