import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

const PORT = process.env.PORT;
const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); // for serving static files
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // for handling media
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );

    next();
});

// multer middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads"); // callback
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname)); // "input.txt" --> file-{uuid}.txt --> .txt comes from extname() & file comes from fieldname
    }
}); // storing media in our disk [In prod: S3 or Cloudinary]

// multer config
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.status(200).json({ message: "HLS Streaming - Proof of Concept" });
});

app.post("/upload", upload.single("file"), (req, res) => {
    const lessonId = uuidv4();
    const videoPath = req.file.path; // user uploaded file path
    const outputPath = `./uploads/courses/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`; // m3u8 chunks manifest [utf-8 encoded playlist file]
    console.log("hlsPath: ", hlsPath);

    if (!fs.existsSync(outputPath)) { // creates the output folder if not present
        fs.mkdirSync(outputPath, { recursive: true })
    }

    // ffmpeg cmd
    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`; // segmenting video from .m3u8 to segments000.ts, segment001.ts etc using "aac" bundler codec

    // In prod: Use event queue in another worker
    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            res.status(400).json({ error: error.message });
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stdout: ${stderr}`);

        const videoUrl = `http://localhost:${PORT}/uploads/courses/${lessonId}/index.m3u8`;

        res.status(201).json({
            message: "file uploaded & video converted to HLS format",
            videoUrl: videoUrl,
            lessonId: lessonId
        });
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});