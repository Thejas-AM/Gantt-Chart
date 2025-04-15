

# 📅 Gantt Chart Project Management Tool

An interactive Gantt chart application for project management with AI-powered task management capabilities.

---

## 🚀 Features

- 📊 Interactive Gantt chart visualization  
- 🤖 AI-powered task management  
- 💬 Natural language processing for task updates  
- 📱 Responsive design  
- 🎨 Customizable task colors and categories  
- 🔄 Drag-and-drop task management  
- 📅 Timeline adjustments  
- 🔗 Task dependencies  
- 💾 Local storage persistence  
- 📤 Export to JSON/CSV  

---

## 🧰 Tech Stack

- **Frontend Framework**: React + TypeScript  
- **UI Components**:  
  - Shadcn/ui  
  - Radix UI  
  - Tailwind CSS  
- **State Management**: React Hooks  
- **Routing**: React Router  
- **Build Tool**: Vite  
- **AI Integration**:  
  - Azure OpenAI  
  - Custom LLM support  
  - Local LLM (Ollama) support  

---

## 📦 Prerequisites

- Node.js (v18 or higher)  
- npm or yarn  
- Docker *(optional, for containerized deployment)*  

---

## 🛠️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/gantt-chart.git
cd gantt-chart

# 2. Install dependencies
npm install

### 🔐 Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_AZURE_API_KEY=your_azure_api_key
VITE_AZURE_ENDPOINT=your_azure_endpoint
VITE_DEPLOYMENT_NAME=your_deployment_name
VITE_OLLAMA_API_URL=http://localhost:11434
```

### ▶️ Run the development server

```bash
npm run dev
```

---

## 🧑‍💼 Usage

### 🗂️ Project Management

- Create a new project by clicking **"New Project"**
- Set project details:
  - Name
  - Description
  - Start Date
  - Resources

### 🧩 Task Management

- **Create Task**: Click the "+" button  
- **Edit Task**: Double-click on a task  
- **Delete Task**: Click the delete icon  
- **Move Task**: Drag and drop  
- **Set Dependencies**: Use the arrows  
- **Update Progress**: Adjust the progress bar  

### 🤖 AI Assistant

Use natural language commands like:

- `"Create a new task called 'Setup Database' starting next week"`  
- `"Move 'Design UI' task to start after 'Requirements Analysis'"`  
- `"Mark 'Testing' as 50% complete"`  
- `"Change the color of 'Development' task to blue"`  

### 📤 Export Options

- **JSON Export**: Full project backup  
- **CSV Export**: Task list for spreadsheets  

---

## 🐳 Docker Deployment

```bash
# 1. Build the Docker image
docker build -t gantt-chart .

# 2. Run the container
docker run -p 80:80 gantt-chart
```

---

## 🤝 Contributing

1. Fork the repository  
2. Create your feature branch:  
   ```bash
   git checkout -b feature/AmazingFeature
   ```  
3. Commit your changes:  
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```  
4. Push to the branch:  
   ```bash
   git push origin feature/AmazingFeature
   ```  
5. Open a Pull Request  

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)  
- [shadcn/ui](https://ui.shadcn.com/)  
- [Lucide Icons](https://lucide.dev/)
