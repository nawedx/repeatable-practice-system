# DSA Spaced Repetition System

A smart CLI application that helps you master Data Structures & Algorithms using spaced repetition. Never forget what you've learned - the system intelligently schedules problem reviews based on your performance!

## ✨ Why This Tool?

- **🧠 Smart Learning**: Uses proven spaced repetition algorithm to maximize retention
- **📈 Track Progress**: See your improvement over time with detailed analytics
- **🎯 Focus Practice**: Identifies weak topics and adjusts accordingly
- **⚡ CLI Efficiency**: Fast, keyboard-friendly interface for developers
- **🔄 No Setup Hassle**: Fully containerized with Docker

## 📋 Prerequisites

Before you start, make sure you have these installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)

**Verify installation:**
```bash
node --version    # Should show v18 or higher
docker --version  # Should show Docker version
```

## 🚀 Quick Start (2 minutes)

```bash
# Step 1: Clone the repository
git clone https://github.com/nawedx/repeatable-practice-system.git
cd repeatable-practice-system
```
✓ *You should now be in the `repeatable-practice-system` directory*

```bash
# Step 2: Start the database
docker-compose up -d
```
✓ *Run `docker ps` - you should see `dsa-mongo` container running*

```bash
# Step 3: Install and build the CLI
npm install && npm run build && npm link
```
✓ *This installs dependencies, compiles TypeScript, and makes `dsa` command available globally*

```bash
# Step 4: Verify it works!
dsa help
```
✓ *You should see the help menu with all available commands*

## 🎯 Try It Now (30 seconds)

Get started with a quick demo:

```bash
# Add your first problem
dsa add "Two Sum" easy "array,hash-table" --time 15 --url "https://leetcode.com/problems/two-sum/"
```
✓ *You should see: "Problem 'Two Sum' added successfully!"*

```bash
# Check what's due today
dsa today
```
✓ *You should see "Two Sum" in your today's list*

```bash
# Mark it complete (try it even if you haven't solved it yet!)
dsa complete "Two Sum" 15 good
```
✓ *Problem marked as complete - it will appear again in 3 days*

```bash
# View your progress
dsa stats
```
✓ *See your first stats! 1 problem completed, streak started*

**Congratulations! You're ready to build your DSA practice habit.**

## 📚 How It Works

1. **Add Problems**: Import problems you want to practice
2. **Daily Reviews**: System shows you problems due for review  
3. **Rate Performance**: After solving, rate how well you did
4. **Smart Scheduling**: Algorithm adjusts future review dates based on your performance
5. **Track Progress**: Monitor improvement and identify weak areas

## 🎯 Commands Reference  

### Daily Workflow
```bash
# Check what's due today
dsa today

# After solving problems, mark them complete
dsa complete "Two Sum" 15 good
dsa complete "Binary Search" 8 easy
```

### Adding Problems
```bash
# Interactive mode (recommended for beginners)
dsa add

# Quick add with all details
dsa add "Merge Intervals" medium "array,sorting" --time 25 --url "https://leetcode.com/problems/merge-intervals/"
```

### Analytics & Planning
```bash
# View your progress and streaks
dsa stats

# See upcoming reviews (next 7 days)
dsa upcoming

# Plan ahead (next 14 days)
dsa upcoming --days 14
```

### Pro Tips
```bash
# Use partial titles for quick completion
dsa complete "merge" 20 good     # Finds "Merge Intervals"
dsa complete "sum" 12 easy       # Finds "Two Sum"

# Add notes for failed attempts
dsa complete "Hard Problem" 45 failed --notes "Need to review dynamic programming"
```

### Performance Ratings

Rate your performance honestly - the algorithm uses this to optimize your learning:

- **`easy`** ⚡ - Solved much faster than expected → Reviews spaced further apart
- **`good`** ✅ - Solved within expected time → Normal progression
- **`hard`** 😅 - Took longer but got it right → Reviews repeat sooner  
- **`failed`** ❌ - Couldn't solve it → Back to tomorrow's queue

## 🧠 The Science Behind It

### Spaced Repetition Algorithm
Uses a modified **SM-2 algorithm** optimized for coding problems:

**Review Schedule:** `1 day → 3 days → 7 days → 14 days → 30 days → 60 days → 120 days`

### Smart Adjustments
- **Easy** ⚡ → Skip ahead in sequence (e.g., 3 days → 14 days)
- **Good** ✅ → Follow normal progression  
- **Hard** 😅 → Stay at current interval longer
- **Failed** ❌ → Reset to tomorrow

### Why It Works
- **Forgetting Curve**: Reviews problems just before you'd forget them
- **Active Recall**: Forces you to retrieve solutions from memory
- **Personalized**: Adapts to your individual learning pace per topic

## 📊 Progress Analytics

### What You'll See
- **🔥 Streak Tracking**: Days of consistent practice
- **📈 Speed Improvement**: How much faster you're getting
- **🎯 Topic Breakdown**: Success rates by algorithm type  
- **⏰ Review Load**: Upcoming workload planning
- **📉 Difficulty Analysis**: Where you struggle most

### Sample Analytics
```
📊 Your DSA Progress Statistics
┌─────────────────────┬─────────┐
│ Total Problems      │ 45      │
│ Completed Today     │ 3       │
│ Current Streak      │ 12 days │
│ Avg Time Improvement│ +23.5%  │
└─────────────────────┴─────────┘

🏷️ Performance by Topic
┌──────────────┬─────────┬─────────┬──────────────┐
│ Topic        │ Tried   │ Success │ Success Rate │
├──────────────┼─────────┼─────────┼──────────────┤
│ Arrays       │ 15      │ 12      │ 80.0%        │
│ Hash Tables  │ 8       │ 7       │ 87.5%        │
│ Dynamic Prog │ 6       │ 3       │ 50.0%        │
└──────────────┴─────────┴─────────┴──────────────┘
```

## 🐳 Docker & Environment

### Quick Docker Setup
```bash
# Everything in one command
docker-compose up -d && npm install && npm run build && npm link
```

### Environment Variables
Create `.env` file for custom settings:
```bash
MONGODB_URI=mongodb://your-user:your-password@localhost:27017/dsa?authSource=admin
```

### Docker Commands
```bash
docker-compose up -d          # Start services
docker-compose logs -f        # View logs  
docker-compose down           # Stop services
docker-compose exec dsa-app dsa today  # Run commands in container
```

## 🔒 Security Note
Default password (`password`) is for development only. Use strong credentials in production via environment variables.

## 💡 Troubleshooting

### Common Issues

**"dsa: command not found" after `npm link`?**
```bash
# Rebuild and relink
npm run build && npm link

# If still not working, check npm global bin path
npm config get prefix
# Add /bin to your PATH if needed
```

**"MongoDB connection failed"?**
```bash
# Check if Docker is running
docker ps

# If no containers, start them
docker-compose up -d

# Check logs if still failing
docker-compose logs mongodb
```

**Want to start fresh?**
```bash
docker-compose down -v  # Removes all data
docker-compose up -d    # Fresh start
```

**Need to uninstall?**
```bash
npm unlink dsa              # Remove global command
docker-compose down -v      # Remove database
rm -rf node_modules dist    # Clean build files
```

## 🚀 What's Next?

### Planned Features
- 📱 Web dashboard for detailed analytics
- 🔄 Import problems from LeetCode lists
- 👥 Team challenges and leaderboards
- 📧 Daily email reminders
- 🎯 Custom difficulty algorithms per topic

### Contributing
We welcome contributions! Areas that need help:
- 🐛 Bug fixes and testing
- 📊 More analytics and visualizations  
- 🔧 Performance optimizations
- 📱 Web interface development

## 📄 License

MIT License - Feel free to fork, modify, and use for your interview prep!

---

## ⭐ Like this project?

Give it a star ⭐ and share it with other developers preparing for technical interviews!

**Happy coding and good luck with your interviews! 🚀**