{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 8,
            "minor": 6,
            "revision": 0,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [140.0, 140.0, 620.0, 310.0],
        "bglocked": 0,
        "openinpresentation": 0,
        "default_fontsize": 12.0,
        "default_fontface": 0,
        "default_fontname": "Arial",
        "gridonopen": 1,
        "gridsize": [15.0, 15.0],
        "gridsnaponopen": 1,
        "objectsnaponopen": 1,
        "statusbarvisible": 2,
        "toolbarvisible": 1,
        "lefttoolbarpinned": 0,
        "toptoolbarpinned": 0,
        "righttoolbarpinned": 0,
        "bottomtoolbarpinned": 0,
        "toolbars_unpinned_last_save": 0,
        "tallnewobj": 0,
        "boxanimatetime": 200,
        "enablehscroll": 1,
        "enablevscroll": 1,
        "devicewidth": 0.0,
        "description": "Writes the current Max Console contents to logs/max/sfs-max-console.txt",
        "digest": "",
        "tags": "sfs,debug,console",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "SFS Max Console Capture",
                    "patching_rect": [35.0, 25.0, 210.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Open this after reproducing an error, or keep it open. It writes the full Max Console to logs/max/sfs-max-console.txt.",
                    "linecount": 2,
                    "patching_rect": [35.0, 50.0, 525.0, 36.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "button",
                    "patching_rect": [35.0, 115.0, 24.0, 24.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "comment",
                    "text": "write console",
                    "patching_rect": [70.0, 118.0, 95.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "message",
                    "text": "clear",
                    "patching_rect": [35.0, 155.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "comment",
                    "text": "clear Max Console",
                    "patching_rect": [95.0, 158.0, 125.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "text": "loadbang",
                    "patching_rect": [250.0, 115.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "message",
                    "text": "write \"D:/My Music/Max/PROJECTS/Silent_Film_Sonific/logs/max/sfs-max-console.txt\"",
                    "patching_rect": [250.0, 155.0, 340.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "text": "console",
                    "patching_rect": [250.0, 205.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "comment",
                    "text": "Output path: logs/max/sfs-max-console.txt",
                    "patching_rect": [350.0, 205.0, 250.0, 20.0]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-8", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-5", 0],
                    "destination": ["obj-9", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-7", 0],
                    "destination": ["obj-8", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-8", 0],
                    "destination": ["obj-9", 0]
                }
            }
        ]
    }
}
