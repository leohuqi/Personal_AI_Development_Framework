import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
public final class RecordStore {
    public static void write(Path root, String owner, String caller, int value) throws IOException {
        // RED: missing persisted-owner boundary.
        Files.writeString(root.resolve("value.txt"), Integer.toString(value));
    }
    public static int read(Path root) throws IOException { return Integer.parseInt(Files.readString(root.resolve("value.txt"))); }
}
