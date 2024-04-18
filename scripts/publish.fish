#!/usr/bin/env fish

argparse --name=publish 'v/version=' -- $argv
or return

if not set -q _flag_version
    echo '--version option is required'
    exit 1
end

for item in rss-feed-viewer:viewer rss-feed-viewer-proxy:proxy
    echo $item
    string match -rq '(?<image>.+?):(?<target>.+)' -- $item

    docker buildx build \
        --platform linux/arm64,linux/amd64 \
        -t glossawy/$image:$_flag_version \
        -t glossawy/$image:latest \
        --target $target \
        --push \
        .
end
