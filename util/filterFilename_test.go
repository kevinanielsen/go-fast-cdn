package util

import "testing"

func TestFilterFilename(t *testing.T) {
	testCases := []struct {
		input    string
		expected string
		wantErr  bool
	}{
		{"file.txt", "file.txt", false},
		{"file/with/slashes.txt", "filewithslashes.txt", false},
		{"file\\with\\backslashes.txt", "filewithbackslashes.txt", false},
		{"file/with/more/than/one.period.txt", "file/with/more/than/one.period.txt", true},
	}

	for _, tc := range testCases {
		t.Run(tc.input, func(t *testing.T) {
			result, err := FilterFilename(tc.input)

			if (err != nil) != tc.wantErr {
				t.Errorf("FilterFilename(%s) error = %v, wantErr %v", tc.input, err, tc.wantErr)
				return
			}

			if result != tc.expected {
				t.Errorf("FilterFilename(%s) = %v, want %v", tc.input, result, tc.expected)
			}
		})
	}
}
