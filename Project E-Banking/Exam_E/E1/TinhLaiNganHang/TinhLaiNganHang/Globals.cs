using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TinhLaiNganHang
{
    class Globals
    {
        public static DateTime NgayGui { get; private set; }
        public static DateTime NgayRut { get; private set; }
        public static float TienGoc { get; private set; }
        public static float[] tableLaiKiHan = new float[1000];     //BANG CHUA THONG TIN LAI SUAT
        public static float[] tableLaiThongThuong = new float[1000];
        public static DateTime[] dateLaiKiHan = new DateTime[1000];     //BANG CHUA NGAY THAY DOI LAI  SUAT
        public static DateTime[] dateLaiThongThuong = new DateTime[1000];
        public static int n { get; set; }                               //DO DAI BANG KI HAN
        public static int tempn { get; set; }
        public static int m { get; set; }                               //DO DAI BANG KHONG KI HAN 
        public static int tempm { get; set; }
//------------------------------------------------------------------------------------------------------------------------------------
//---Cac Ham Nhap Thong Thuong
        public static void setKiHan(float lai, DateTime ngay )
        {
            tableLaiKiHan[n] = lai;
            dateLaiKiHan[n] = ngay;
            n++;
        }

        public static void setKhongKiHan(float lai, DateTime ngay)
        {
            tableLaiThongThuong[m] = lai;
            dateLaiThongThuong[m] = ngay;
            m++;
        }
        public static void setn(int N)
        {
            n = N;
        }
        public static void setm(int M)
        {
            m = M;
        }
        public static void setNgayGui(DateTime ngaygui)
        {
            NgayGui = ngaygui;
        }
        public static void setNgayRut(DateTime ngayrut)
        {
            NgayRut = ngayrut;
        }
        public static void setTienGoc(float tiengoc)
        {
            TienGoc = tiengoc;
        }
//------------------------------------------------------------------------------------------------------------------------------------
//--- Ham Tinh Lai Chinh
        public static void TinhLai()
        {
            tempm = 0;
            tempn = 0;
            //LaiNam();
            LaiThang();
            LaiNgay();
        }
      
        public static void LaiNam()
        {
            try
            {
                TimeSpan tg = NgayRut - NgayGui;
                if (tg.Days >= 365)
                {
                    getngayKiHan(NgayGui);

                    setTienGoc(TienGoc * ((float)1 + (float)tableLaiKiHan[tempn-1] / (float)100));
                    setNgayGui(NgayGui.AddYears(1));
                    LaiNam();
                }
            }
            catch {; }
        }
        public static void LaiThang()
        {
            try
            {
                TimeSpan tg = NgayRut - NgayGui;
                if (tg.Days >= 90)
                {
                    getngayKiHan(NgayGui);
                    setTienGoc(TienGoc * ((float)1 + (float)(tableLaiKiHan[tempn-1]*3) / (float)(100*12)));
                    setNgayGui(NgayGui.AddMonths(3));
                    LaiThang();
                }
            }
            catch {; }
        }
        public static void getngayKiHan(DateTime ngaygui)       //Tim ngay gan voi ngay gui nhat
        {

            if (tempn >= n) ;
            else
            {
                TimeSpan tg = ngaygui - dateLaiKiHan[tempn];
                int TongSoNgay = tg.Days;
                if (TongSoNgay > 0)
                {
                    tempn++;
                    getngayKiHan(ngaygui);
                }
            }
        }
        public static void getngayThongThuong(DateTime ngaygui)       //Tim ngay gan voi ngay gui nhat
        {
            for (int i = m - 1; i > 0; i--)
                if (DateTime.Compare(NgayGui, dateLaiThongThuong[i]) > 0)
                {
                    tempm = i;
                    break;
                }
        }

        public static void LaiNgay()
        {
            try
            {
                TimeSpan tg = NgayRut - NgayGui;
                if (tg.Days <= 0) ;
                else
                {
                    tempm = 0;
                    getngayThongThuong(NgayGui);
                    LaiNgayTT();
                }
            }
            catch {; }
        }
        public static void LaiNgayTT()
        {
            try
            {

                if (tempm == m - 1 || DateTime.Compare(dateLaiThongThuong[tempm + 1], NgayRut) > 0)
                {
                    TimeSpan tg = NgayRut - NgayGui;
                    setNgayGui(NgayGui.AddDays(tg.Days));
                    setTienGoc(TienGoc * ((float)1 + (float)(tableLaiThongThuong[tempm] * tg.Days) / (float)(100 * 365)));
                }
                else
                {
                    TimeSpan tg = dateLaiThongThuong[tempm + 1] - NgayGui;
                    setNgayGui(dateLaiThongThuong[tempm + 1]);
                    setTienGoc(TienGoc * ((float)1 + (float)(tableLaiThongThuong[tempm] * tg.Days) / (float)(100 * 365)));
                    tempm++;
                    LaiNgayTT();
                }

            }
            catch {; }
        }

    }
}
