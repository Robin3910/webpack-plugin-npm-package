const imageSize = require('image-size'); // 引入读取二进制流图片大小的包
const fs = require('fs');
const reg = /\.(jpg|jpeg|gif|png|bmp|CUR|DDS|ICNS|ICO|KTX|PSD|SVG|TIFF|WebP)$/ig; // 用于匹配图片的正则

// 用于监测打包的图片是否文件大小或者是宽高超出了限制，只能提供一个警告，并不能真正拦截掉图片的打包
class ImgFilterPlugin {
    constructor(options) {

        // webpack.config.js中可以配置限制的宽高以及文件大小
        this.sizeLimit = options.sizeLimit ? options.sizeLimit : 10000000;// 默认10M
        this.widthLimit = options.widthLimit ? options.widthLimit : 3000; // 默认3000px
        this.heightLimit = options.heightLimit ? options.heightLimit : 3000; // 默认3000px
    }

    apply(compiler) {
        // 挂载在emit钩子上
        compiler.hooks.emit.tap('ImgFilterPlugin', (compilation) => {
            const dependencies = compilation.fileDependencies; // 获取依赖树
            dependencies.forEach((file) => {
                if (reg.test(file)) { // 判断是否满足后缀名条件

                    // 获取文件属性
                    const stat = fs.statSync(file);
                    const fileSize = stat.size;

                    // 获取图片宽高
                    const dimensions = imageSize(file);

                    if (fileSize > this.sizeLimit || dimensions.width > this.widthLimit || dimensions.height > this.heightLimit) {
                        console.log(`\n[img-filter-plugin] warning!! some img oversize`, {
                            fileInfo: {
                                file,
                                fileSize,
                                imgWidth: dimensions.width,
                                imgHeight: dimensions.height,
                            },
                        });
                    }
                }
            });
        });
    }
}

module.exports = ImgFilterPlugin;
