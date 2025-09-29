# Deploy Flask API to Railway for Production NFL Data

## Problem Statement

The portfolio site currently shows different data sources between local and production environments:
- **Local**: "📅 Real 2025 NFL target data for Week 3" (connects to localhost:5001 Flask API)
- **Netlify**: "📅 Using mock data - API unavailable" (can't access localhost:5001)

The Flask API server that scrapes FantasyPros for real NFL data runs locally but isn't deployed to production, causing the live site to fall back to mock data.

## Solution Overview

Deploy the Flask API server to Railway to provide real NFL data to the production site.

## Implementation Plan

### Phase 1: API Preparation & Testing
- [ ] **Audit Flask API dependencies** (`backend/requirements.txt`)
- [ ] **Test local API endpoints** to ensure functionality
- [ ] **Verify FantasyPros scraper** works reliably
- [ ] **Add environment variable configuration** for production
- [ ] **Create Railway deployment configuration**

### Phase 2: Railway Setup & Deployment
- [ ] **Create Railway account** and connect GitHub repository
- [ ] **Configure Railway service** for Flask API
- [ ] **Set up environment variables** in Railway dashboard
- [ ] **Deploy API to Railway** and get production URL
- [ ] **Test deployed API endpoints** to ensure scraping works

### Phase 3: Frontend Integration
- [ ] **Update environment variables** in Netlify
  - Set `REACT_APP_NFL_API_URL=https://your-app.railway.app/api`
- [ ] **Test production deployment** end-to-end
- [ ] **Verify real data display** on live site

### Phase 4: Monitoring & Documentation
- [ ] **Set up basic monitoring** for API health
- [ ] **Document deployment process** in README
- [ ] **Create production troubleshooting guide**

## Technical Requirements

### Railway Configuration
```yaml
# railway.toml (to be created)
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python src/api_server.py"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
PORT = { default = "5001" }
FLASK_ENV = { default = "production" }
```

### Environment Variables Needed
- `CORS_ORIGINS`: Frontend URLs (Netlify + localhost)
- `DATA_DIRECTORY`: Directory for cached data
- `FLASK_ENV`: Production environment
- `PORT`: Railway auto-assigned port

### File Structure Changes
```
backend/
├── src/
│   ├── api_server.py          # Main Flask app
│   ├── fantasypros_scraper.py # NFL data scraper
│   ├── espn_data_scraper.py   # ESPN integration
│   └── nfl_player_db.py       # Player database
├── requirements.txt           # Python dependencies
├── railway.toml              # Railway config (new)
└── README.md                 # Deployment docs (update)
```

## Cost Analysis

**Railway Pricing**:
- $5/month free credit (sufficient for lightweight Flask API)
- Pay-per-use after free tier (~$0.10/GB RAM/hour)
- **Expected cost**: $0-3/month for this application

## Success Criteria

- [ ] Live site displays "📅 Real 2025 NFL target data" instead of mock data warning
- [ ] API responds reliably with <2 second response times
- [ ] FantasyPros scraping works consistently in production
- [ ] No increase in Netlify build times or errors

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|---------|------------|
| FantasyPros blocks scraping | High | Add user agent rotation, respect rate limits |
| Railway free tier limits | Medium | Monitor usage, upgrade if needed |
| CORS issues | Medium | Configure proper origins for Netlify domain |
| API downtime | Medium | Implement graceful fallback to mock data |

## Timeline

**Estimated completion**: 2-3 hours over 1-2 days

- **Day 1**: Phase 1-2 (Preparation & Railway deployment) - 2 hours
- **Day 2**: Phase 3-4 (Integration & testing) - 1 hour

## Dependencies

- Active Railway account (free tier sufficient)
- Access to Netlify environment variables
- GitHub repository permissions for Railway integration

## Acceptance Criteria

- ✅ Production site shows real NFL data instead of mock data
- ✅ API deployment is automated via GitHub integration
- ✅ Documentation updated with deployment instructions
- ✅ Monitoring/health checks implemented
- ✅ Cost remains under $5/month

---

**Priority**: High
**Estimated Effort**: 3 hours
**Labels**: enhancement, deployment, production, api