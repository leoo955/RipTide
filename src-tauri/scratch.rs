use rusty_ytdl::Video;
use futures::StreamExt;

#[tokio::main]
async fn main() {
    let video = Video::new("https://www.youtube.com/watch?v=FZ8BxMU3BYc").unwrap();
    let mut stream = video.stream().await.unwrap();
    while let Some(chunk) = stream.next().await {
        println!("Chunk size: {}", chunk.unwrap().len());
        break;
    }
}
