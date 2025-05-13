/** @type {HTMLCanvasElement} */
class WheelRenderer {
    static CONFIG = {
        CANVAS_SIZE: 750,
        RADIUS_OFFSET: 10,
        BORDER_WIDTH: 5,
        TEXT_STYLE: {
            font: "24px sans-serif",
            color: "#ffffff",
            alignment: "center",
            baseline: "middle",
            offset: 0.55,
            baseRotation: 0,
        },
        GRADIENT_STOPS: [
            { position: 0.33, color: "rgba(0,0,0,1)" },
            { position: 0.55, color: "rgba(0,0,0,0.8)" },
            { position: 0.77, color: "rgba(0,0,0,0.3)" },
            { position: 1, color: "rgba(255,255,255,0.3)" },
        ],
        SLICES: { borderWidth: 2, borderColor: "#333" },
        BACKGROUND_COLOR: "#111",
        BORDER_COLOR: "#000",
        BASE_IMAGE_SIZE: 0.9,
        FALLBACK: {
            width: 200,
            height: 200,
        },
    };

    static imageCache = new Map();

    destroy() {
        this.canvas.width = 0;
    }

    constructor(canvasId, data) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.data = data;
        this.center = { x: 0, y: 0 };
        this.radius = 0;
        this.spinState = {
            isSpinning: false,
            rotation: 0,
            speed: 0,
            targetSpeed: 0.05,
            friction: 0.99,
        };

        this.initCanvas();
    }

    initCanvas() {
        const { CANVAS_SIZE, RADIUS_OFFSET } = WheelRenderer.CONFIG;
        this.canvas.width = this.canvas.height = CANVAS_SIZE;
        this.center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
        };
        this.radius = this.canvas.width / 2 - RADIUS_OFFSET;
    }

    async initialize() {
        await this.loadImages();
        this.generateSlices();
        this.draw();
    }

    async loadImages() {
        this.items = await Promise.all(this.data.map((item) => this.loadImageWithLabel(item)));
    }

    async loadImageWithLabel(item) {
        if (WheelRenderer.imageCache.has(item.image)) {
            return { ...item, img: WheelRenderer.imageCache.get(item.image) };
        }

        try {
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => {
                    WheelRenderer.imageCache.set(item.image, image);
                    resolve(image);
                };
                image.onerror = reject;
                image.src = item.image;
            });
            return { ...item, img };
        } catch {
            return {
                ...item,
                img: this.createColorPlaceholder(),
            };
        }
    }

    createColorPlaceholder() {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 100;
        const ctx = canvas.getContext("2d");

        // Single random pleasant color
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        ctx.fillRect(0, 0, 100, 100);

        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    generateSlices() {
        this.slices = this.data.map((_, i) => {
            const sliceAngle = (2 * Math.PI) / this.data.length;
            const start = i * sliceAngle;
            const end = (i + 1) * sliceAngle;
            return {
                start,
                end,
                mid: start + sliceAngle / 2,
            };
        });
    }

    updateSliceAngles() {
        const sliceAngle = (2 * Math.PI) / this.data.length;
        this.slices.forEach((slice, i) => {
            slice.start = i * sliceAngle;
            slice.end = (i + 1) * sliceAngle;
            slice.mid = slice.start + sliceAngle / 2;
        });
    }

    draw() {
        this.clearCanvas();
        this.drawBackground();

        // Apply rotation transform
        this.ctx.save();
        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.rotate(this.spinState.rotation);
        this.ctx.translate(-this.center.x, -this.center.y);

        this.drawSlices();
        this.ctx.restore();

        this.drawBorder();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        const { BACKGROUND_COLOR, BORDER_COLOR } = WheelRenderer.CONFIG;
        this.canvas.style.backgroundColor = BORDER_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = BACKGROUND_COLOR;
        this.ctx.fill();
    }

    createSliceGradient(startAngle, endAngle) {
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const gradientEnd = {
            x: this.center.x + this.radius * Math.cos(midAngle),
            y: this.center.y + this.radius * Math.sin(midAngle),
        };

        const gradient = this.ctx.createLinearGradient(this.center.x, this.center.y, gradientEnd.x, gradientEnd.y);

        WheelRenderer.CONFIG.GRADIENT_STOPS.forEach((stop) => {
            gradient.addColorStop(stop.position, stop.color);
        });

        return gradient;
    }

    drawSlices() {
        this.slices.forEach((slice, i) => {
            this.drawSlice(slice.start, slice.end, slice.mid, this.items[i].img);
            this.drawSliceLabel(this.items[i].label, slice.mid);
        });
        this.drawAllBorders();
    }

    drawSlice(startAngle, endAngle, midAngle, img) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.center.x, this.center.y);
        this.ctx.arc(this.center.x, this.center.y, this.radius, startAngle, endAngle);
        this.ctx.closePath();
        this.ctx.clip();

        this.drawSliceImage(img, midAngle);

        this.ctx.fillStyle = this.createSliceGradient(startAngle, endAngle);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawSliceImage(img, midAngle) {
        const { BASE_IMAGE_SIZE } = WheelRenderer.CONFIG;
        const aspectRatio = img.width / img.height;
        const height = this.radius * BASE_IMAGE_SIZE;
        const width = height * aspectRatio;

        this.ctx.save();
        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.rotate(midAngle + Math.PI / 2);

        this.ctx.drawImage(img, -width / 2, -height * 1.1, width, height);
        this.ctx.restore();
    }

    drawSliceLabel(label, midAngle) {
        const { TEXT_STYLE } = WheelRenderer.CONFIG;
        const labelPosition = {
            x: this.center.x + this.radius * TEXT_STYLE.offset * Math.cos(midAngle),
            y: this.center.y + this.radius * TEXT_STYLE.offset * Math.sin(midAngle),
        };

        this.ctx.save();
        this.ctx.translate(labelPosition.x, labelPosition.y);
        this.ctx.rotate(midAngle + (TEXT_STYLE.baseRotation || 0));

        this.ctx.textAlign = TEXT_STYLE.alignment;
        this.ctx.textBaseline = TEXT_STYLE.baseline;
        this.ctx.fillStyle = TEXT_STYLE.color;
        this.ctx.font = TEXT_STYLE.font;

        this.ctx.fillText(label, 0, 0);
        this.ctx.restore();
    }

    drawAllBorders() {
        const { SLICES } = WheelRenderer.CONFIG;
        const path = new Path2D();

        this.slices.forEach((slice) => {
            path.moveTo(this.center.x, this.center.y);
            path.lineTo(this.center.x + this.radius * Math.cos(slice.start), this.center.y + this.radius * Math.sin(slice.start));
        });

        this.ctx.strokeStyle = SLICES.borderColor;
        this.ctx.lineWidth = SLICES.borderWidth;
        this.ctx.stroke(path);
    }

    drawBorder() {
        const { BORDER_WIDTH, BORDER_COLOR } = WheelRenderer.CONFIG;

        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);

        this.ctx.lineWidth = BORDER_WIDTH;
        this.ctx.strokeStyle = BORDER_COLOR;
        this.ctx.stroke();
    }

    spin() {
        if (this.spinState.isSpinning) return;

        this.spinState = {
            isSpinning: true,
            rotation: this.spinState.rotation,
            speed: 0.05 + Math.random() * 0.03,
            targetSpeed: 0,
            friction: 0.985 + Math.random() * 0.01,
            spinDuration: 3000 + Math.random() * 2000,
            startTime: performance.now(),
        };

        this.animate();
    }

    animate() {
        const elapsed = performance.now() - this.spinState.startTime;
        const progress = Math.min(elapsed / this.spinState.spinDuration, 1);

        const t = progress;
        const speedFactor = 1 - t * t;

        this.spinState.rotation += this.spinState.speed * speedFactor;

        if (progress < 1) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.spinState.isSpinning = false;
            this.onSpinEnd();
        }

        this.draw();
    }

    onSpinEnd() {
        const normalizedRotation = ((this.spinState.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const sliceAngle = (2 * Math.PI) / this.data.length;
        let selectedIndex = Math.floor((Math.PI * 1.5 - normalizedRotation) / sliceAngle) % this.data.length;

        selectedIndex = (selectedIndex + this.data.length) % this.data.length;

        console.log("Selected:", this.data[selectedIndex].label);
    }
}

const wheel = new WheelRenderer("wheel", [
    { label: "Viper", image: "./assets/img/Naraka/viper.png" },
    { label: "Feria", image: "./assets/img/Naraka/feria.png" },
    { label: "Tianhai", image: "./assets/img/Naraka/tianhai.png" },
    { label: "Ziping", image: "./assets/img/Naraka/ziping.png" },
    { label: "Temulch", image: "./assets/img/Naraka/temulch.png" },
    { label: "Tarka", image: "./assets/img/Naraka/tarka.png" },
    { label: "Kurumi", image: "./assets/img/Naraka/kurumi.png" },
    { label: "Yoto", image: "./assets/img/Naraka/yoto.png" },
    { label: "Valda", image: "./assets/img/Naraka/valda.png" },
    { label: "Yueshan", image: "./assets/img/Naraka/yueshan.png" },
    { label: "Wuchen", image: "./assets/img/Naraka/wushen.png" },
    { label: "Justina", image: "./assets/img/Naraka/lannie.png" },
    { label: "Takeda", image: "./assets/img/Naraka/takeda.png" },
    { label: "Matari", image: "./assets/img/Naraka/matari.png" },
    { label: "Akos", image: "./assets/img/Naraka/akos.png" },
    { label: "Zaï", image: "./assets/img/Naraka/zai.png" },
    { label: "Tessa", image: "./assets/img/Naraka/tessa.png" },
    { label: "Hadi", image: "./assets/img/Naraka/hadi.png" },
    { label: "Shayol", image: "./assets/img/Naraka/shayol.png" },
    { label: "Lyam", image: "./assets/img/Naraka/lyam.png" },
    { label: "Kylin", image: "./assets/img/Naraka/kylin.png" },
    { label: "Cyra", image: "./assets/img/Naraka/cyra.png" },
    { label: "Lannie", image: "./assets/img/Naraka/lannie.png" },
]);

wheel
    .initialize()
    .then(() => {
        wheel.canvas.addEventListener("click", () => wheel.spin());
    })
    .catch((error) => {
        console.error("Error initializing wheel:", error);
    });
