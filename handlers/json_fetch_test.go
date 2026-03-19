package handlers

import (
	"testing"
)

func TestIsBlockedHost(t *testing.T) {
	cases := []struct {
		host    string
		blocked bool
	}{
		{"localhost", true},
		{"127.0.0.1", true},
		{"127.0.0.100", true},
		{"192.168.1.1", true},
		{"192.168.255.255", true},
		{"10.0.0.1", true},
		{"10.255.255.255", true},
		{"172.16.0.1", true},
		{"172.31.255.255", true},
		{"0.0.0.0", true},
		{"::1", true},
		{"api.github.com", false},
		{"jsonplaceholder.typicode.com", false},
		{"example.com", false},
		{"google.com", false},
		{"1.1.1.1", false},
		{"8.8.8.8", false},
	}

	for _, c := range cases {
		got := isBlockedHost(c.host)
		if got != c.blocked {
			t.Errorf("host=%s: want blocked=%v, got=%v", c.host, c.blocked, got)
		}
	}
}

func TestSimplifyError(t *testing.T) {
	cases := []struct {
		input    string
		expected string
	}{
		{"dial tcp: i/o timeout", "connection timeout"},
		{"context deadline exceeded", "connection timeout"},
		{"no such host", "host not found"},
		{"connection refused", "connection refused"},
		{"unknown error", "network error"},
	}

	for _, c := range cases {
		got := simplifyError(c.input)
		if got != c.expected {
			t.Errorf("input=%s: want %s, got %s", c.input, c.expected, got)
		}
	}
}
