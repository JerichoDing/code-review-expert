/**
 * Code Review Expert - Installation Hooks
 * 用于在安装时与用户进行交互，收集项目配置信息
 */

module.exports = {
  /**
   * 安装前钩子 - 收集用户配置
   */
  async onBeforeInstall(context) {
    console.log('\n🔧 Code Review Expert - 项目配置\n');
    console.log('请选择你的项目配置信息，以便我们提供更精确的代码审查建议。\n');

    const inquirer = context.inquirer;
    
    // 第一步：选择编程语言（必填）
    const languageAnswers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'programming_languages',
        message: '📝 选择编程语言（支持多选）',
        choices: [
          { name: 'TypeScript/JavaScript', value: 'typescript' },
          { name: 'Python', value: 'python' },
          { name: 'Go', value: 'go' },
          { name: 'Java', value: 'java' },
          { name: 'C#', value: 'csharp' },
          { name: 'Rust', value: 'rust' },
          { name: 'C/C++', value: 'cpp' },
          { name: 'PHP', value: 'php' },
          { name: 'Ruby', value: 'ruby' },
          { name: '其他', value: 'other' },
        ],
        validate(answer) {
          return answer.length > 0 || '至少选择一种编程语言';
        },
      },
    ]);

    // 第二步：选择框架（可选）
    const frameworkAnswers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'frameworks',
        message: '🎨 选择框架（可选，支持多选）',
        choices: [
          new inquirer.Separator('--- 前端框架 ---'),
          { name: 'React', value: 'react' },
          { name: 'Vue', value: 'vue' },
          { name: 'Angular', value: 'angular' },
          { name: 'Svelte', value: 'svelte' },
          { name: 'Next.js', value: 'nextjs' },
          { name: 'Nuxt', value: 'nuxt' },
          new inquirer.Separator('--- 后端框架 ---'),
          { name: 'Node.js/Express', value: 'express' },
          { name: 'Koa', value: 'koa' },
          { name: 'Django', value: 'django' },
          { name: 'FastAPI', value: 'fastapi' },
          { name: 'Gin', value: 'gin' },
          { name: 'Fiber', value: 'fiber' },
          { name: 'Spring', value: 'spring' },
          { name: 'ASP.NET', value: 'aspnet' },
          new inquirer.Separator('--- 移动框架 ---'),
          { name: 'React Native', value: 'react-native' },
          { name: 'Flutter', value: 'flutter' },
          { name: 'Swift', value: 'swift' },
          { name: 'Kotlin', value: 'kotlin' },
        ],
      },
    ]);

    // 第三步：选择 UI 组件库（可选，仅当有前端框架时）
    let uiLibraryAnswers = { ui_libraries: [] };
    if (frameworkAnswers.frameworks.some(f => ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt'].includes(f))) {
      uiLibraryAnswers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'ui_libraries',
          message: '🎯 选择 UI 组件库（可选，支持多选）',
          choices: [
            { name: 'Ant Design (antd)', value: 'antd' },
            { name: 'Vben Admin', value: 'vben' },
            { name: 'Element UI', value: 'element-ui' },
            { name: 'Material-UI (MUI)', value: 'mui' },
            { name: 'Bootstrap', value: 'bootstrap' },
            { name: 'Tailwind CSS', value: 'tailwind' },
            { name: 'Chakra UI', value: 'chakra' },
            { name: '其他', value: 'other' },
          ],
        },
      ]);
    }

    // 合并所有答案
    const config = {
      ...languageAnswers,
      ...frameworkAnswers,
      ...uiLibraryAnswers,
    };

    // 保存配置到上下文
    context.config = config;

    // 显示配置总结
    console.log('\n✅ 配置已保存：');
    console.log(`   编程语言: ${config.programming_languages.join(', ')}`);
    if (config.frameworks.length > 0) {
      console.log(`   框架: ${config.frameworks.join(', ')}`);
    }
    if (config.ui_libraries.length > 0) {
      console.log(`   UI 组件库: ${config.ui_libraries.join(', ')}`);
    }
    console.log('\n');

    return config;
  },

  /**
   * 安装后钩子 - 完成安装
   */
  async onAfterInstall(context) {
    console.log('✨ Code Review Expert 安装完成！\n');
    console.log('使用方法：');
    console.log('  /code-review-expert - 审查当前 git 变更\n');
    console.log('配置已保存。审查时将根据你的项目配置提供专项建议。\n');
  },

  /**
   * 运行前钩子 - 在执行审查前加载配置
   */
  async onBeforeExecute(context) {
    // 从存储的配置中加载用户选择
    const config = context.config || {};
    
    // 将用户配置注入到 prompt 中
    if (config.programming_languages && config.programming_languages.length > 0) {
      const languages = config.programming_languages.join(', ');
      const frameworks = config.frameworks?.join(', ') || 'N/A';
      const libraries = config.ui_libraries?.join(', ') || 'N/A';
      
      context.systemPrompt = `
项目配置信息：
- 编程语言: ${languages}
- 框架: ${frameworks}
- UI 组件库: ${libraries}

请根据以上项目配置提供针对性的代码审查建议。
      `;
    }

    return context;
  },
};
