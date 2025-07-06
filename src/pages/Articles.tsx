import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft } from "lucide-react";

const Articles = () => {
  const { data: articles, isLoading } = useArticles('published');

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            المقالات
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            مجموعة من المقالات المتخصصة في إدارة المنتجات والنمو في الشركات الناشئة
          </p>
        </div>

        {/* Articles Grid - 2 columns × 5 rows for 10 cards */}
        <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
          {isLoading ? (
            // Loading skeletons - 10 cards in 2 columns
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border h-72">
                <div className="p-4 h-full flex flex-col">
                  <Skeleton className="w-full h-32 rounded mb-4 flex-shrink-0" />
                  <div className="flex-1 flex flex-col">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-16 w-full flex-1 mb-4" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : articles && articles.length > 0 ? (
            articles.slice(0, 10).map((article) => (
              <Link key={article.id} to={`/article/${article.id}`}>
                <div className="bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group relative h-72 hover:scale-105">
                  <div className="p-4 h-full flex flex-col" dir="rtl">
                    {/* الصورة في الأعلى */}
                    <div className="w-full h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center mb-4">
                      <img
                        src={article.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* المحتوى */}
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-card-foreground mb-2 leading-tight line-clamp-2 min-h-[3rem]">
                          {article.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 min-h-[4rem] mb-4">
                          {article.excerpt}
                        </p>
                      </div>
                      
                      {/* المعلومات في الأسفل */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <Badge variant="secondary" className="bg-primary/10 text-primary font-medium text-sm w-fit">
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(article.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronLeft className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد مقالات متاحة حالياً.</p>
            </div>
          )}
        </div>

        {/* Load More Button - show if there are more than 10 articles */}
        {articles && articles.length > 10 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              تحميل المزيد من المقالات
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Articles;