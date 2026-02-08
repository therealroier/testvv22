local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local lp = Players.LocalPlayer
local PlayerGui = lp:WaitForChild("PlayerGui")
local httpRequest = (syn and syn.request) or request or http_request

local Junkie = {}
Junkie.service = "Silent"
Junkie.identifier = "1009035"
Junkie.base_url = "https://api.jnkie.com/api/v1/whitelist"

function Junkie.check_key(key)
    local resp = httpRequest({
        Method = "POST",
        Url = Junkie.base_url .. "/verifyOpen",
        Headers = {["Content-Type"] = "application/json"},
        Body = HttpService:JSONEncode({
            key = tostring(key or ""),
            service = Junkie.service,
            identifier = tostring(Junkie.identifier)
        })
    })
    if not resp or resp.StatusCode ~= 200 then return {valid = false} end
    return HttpService:JSONDecode(resp.Body)
end

local API_URL = "https://testvv22.vercel.app/api/auth"
local API_KEY = "Bearer DZisthegoat"

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "DZ_Auth_V3"
ScreenGui.Parent = PlayerGui

local Main = Instance.new("Frame")
Main.Size = UDim2.new(0, 320, 0, 520)
Main.Position = UDim2.new(0.5, -160, 0.5, -260)
Main.BackgroundColor3 = Color3.fromRGB(12, 12, 12)
Main.BorderSizePixel = 0
Main.Parent = ScreenGui

local function CreateInput(placeholder, pos, isPass)
    local Box = Instance.new("TextBox")
    Box.Size = UDim2.new(0, 260, 0, 42)
    Box.Position = UDim2.new(0.5, -130, 0, pos)
    Box.PlaceholderText = placeholder
    Box.Text = ""
    Box.BackgroundColor3 = Color3.fromRGB(22, 22, 22)
    Box.TextColor3 = Color3.fromRGB(255, 255, 255)
    Box.Font = Enum.Font.Gotham
    Box.TextSize = 13
    if isPass then Box.TextDisplayMode = Enum.TextDisplayMode.Password end
    Box.Parent = Main
    local C = Instance.new("UICorner")
    C.CornerRadius = UDim.new(0, 6)
    C.Parent = Box
    return Box
end

local function CreateBtn(text, pos, color)
    local B = Instance.new("TextButton")
    B.Size = UDim2.new(0, 260, 0, 42)
    B.Position = UDim2.new(0.5, -130, 0, pos)
    B.Text = text
    B.BackgroundColor3 = color
    B.TextColor3 = Color3.fromRGB(255, 255, 255)
    B.Font = Enum.Font.GothamBold
    B.TextSize = 13
    B.Parent = Main
    local C = Instance.new("UICorner")
    C.CornerRadius = UDim.new(0, 6)
    C.Parent = B
    return B
end

local LogNick = CreateInput("Nickname", 45, false)
local LogPass = CreateInput("Password", 95, true)
local LogBtn = CreateBtn("LOGIN", 150, Color3.fromRGB(0, 120, 255))

local RegNick = CreateInput("Nickname", 255, false)
local RegPass = CreateInput("Password", 305, true)
local RegLic = CreateInput("License Key", 355, false)
local RegBtn = CreateBtn("CREATE ACCOUNT", 410, Color3.fromRGB(40, 180, 100))

local function startHeartbeat(user)
    task.spawn(function()
        while task.wait(40) do
            pcall(function()
                httpRequest({
                    Url = API_URL,
                    Method = "POST",
                    Headers = {["Content-Type"] = "application/json", ["Authorization"] = API_KEY},
                    Body = HttpService:JSONEncode({
                        action = "heartbeat",
                        nickname = user
                    })
                })
            end)
        end
    end)
end

RegBtn.MouseButton1Click:Connect(function()
    RegBtn.Text = "VERIFYING..."
    local status = Junkie.check_key(RegLic.Text)
    if status and status.valid then
        local res = httpRequest({
            Url = API_URL,
            Method = "POST",
            Headers = {["Content-Type"] = "application/json", ["Authorization"] = API_KEY},
            Body = HttpService:JSONEncode({
                action = "register",
                nickname = RegNick.Text,
                password = RegPass.Text,
                license = RegLic.Text
            })
        })
        if res.StatusCode == 200 then
            RegBtn.Text = "REGISTERED ✅"
        else
            RegBtn.Text = "ERROR / EXISTS"
        end
    else
        RegBtn.Text = "INVALID JUNKIE KEY"
    end
    task.wait(2)
    RegBtn.Text = "CREATE ACCOUNT"
end)

LogBtn.MouseButton1Click:Connect(function()
    LogBtn.Text = "CONNECTING..."
    local res = httpRequest({
        Url = API_URL,
        Method = "POST",
        Headers = {["Content-Type"] = "application/json", ["Authorization"] = API_KEY},
        Body = HttpService:JSONEncode({
            action = "login",
            nickname = LogNick.Text,
            password = LogPass.Text
        })
    })

    if res.StatusCode == 200 then
        local data = HttpService:JSONDecode(res.Body)
        local check = Junkie.check_key(data.license)
        if check and check.valid then
            LogBtn.Text = "WELCOME"
            local currentUser = LogNick.Text
            ScreenGui:Destroy()
            startHeartbeat(currentUser)
            loadstring(game:HttpGet(data.script))()
        else
            LogBtn.Text = "KEY EXPIRED"
            httpRequest({
                Url = API_URL,
                Method = "POST",
                Headers = {["Content-Type"] = "application/json", ["Authorization"] = API_KEY},
                Body = HttpService:JSONEncode({
                    action = "delete",
                    nickname = LogNick.Text
                })
            })
        end
    else
        LogBtn.Text = "WRONG CREDENTIALS"
    end
    task.wait(2)
    LogBtn.Text = "LOGIN"
end)
