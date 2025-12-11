// gulpfile.mjs（纯 ES 模块，适配 del@8.x + gulp@5.x）
import gulp from 'gulp';
import ts from 'gulp-typescript';
import { deleteAsync } from 'del';

// 1. 加载 TS 配置（确保已执行 npx tsc --init 生成 tsconfig.json）
const tsProject = ts.createProject('tsconfig.json');

// 2. 清理 dist 目录（仅定义一次，用 deleteAsync）
gulp.task('clean', async () => {
  await deleteAsync(['dist']);
});

// 3. 编译 TS 文件
gulp.task('compile-ts', () => {
  return tsProject.src()
      .pipe(tsProject())
      .js.pipe(gulp.dest('dist'));
});

// 4. 复制静态文件（manifest.json/SVG/HTML）
gulp.task('copy-static', () => {
  return gulp.src('static/**/*').pipe(gulp.dest('dist'));
});

// 5. 监听文件变化
gulp.task('watch', () => {
  gulp.watch('src/**/*.ts', gulp.series('compile-ts'));
  gulp.watch('static/**/*', gulp.series('copy-static'));
});

// 6. 全量构建任务
gulp.task('build', gulp.series('clean', 'compile-ts', 'copy-static'));

// 7. 默认任务（开发模式）
gulp.task('default', gulp.series('build', 'watch'));