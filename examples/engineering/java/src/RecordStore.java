import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
public final class RecordStore {
    public static void write(Path root, String owner, String caller, int value) throws IOException {
        if (!owner.equals(caller)) throw new SecurityException("record unavailable");
        if (value < 0) throw new IllegalArgumentException("nonnegative value required");
        Files.writeString(root.resolve("value.txt"), Integer.toString(value));
    }
    public static int read(Path root) throws IOException { return Integer.parseInt(Files.readString(root.resolve("value.txt"))); }
}
