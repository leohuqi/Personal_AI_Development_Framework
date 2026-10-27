import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.io.TempDir;
import static org.junit.jupiter.api.Assertions.*;
public class RecordStoreTest {
    @TempDir Path directory;
    @Test @Tag("functional") @Tag("integration") void ownerRoundTrip() throws Exception {
        RecordStore.write(directory, "alice", "alice", 12);
        assertEquals(12, RecordStore.read(directory));
    }
    @Test @Tag("functional") @Tag("integration") void otherOwnerCannotOverwrite() throws Exception {
        RecordStore.write(directory, "alice", "alice", 8);
        assertThrows(SecurityException.class, () -> RecordStore.write(directory, "alice", "bob", 99));
        assertEquals(8, RecordStore.read(directory));
    }
    @Test @Tag("unit") void rejectsNegativeValue() {
        assertThrows(IllegalArgumentException.class, () -> RecordStore.write(directory, "alice", "alice", -1));
    }
}
